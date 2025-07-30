'use client';

import Image from "next/image";
import styles from "./page.module.css";
import { useState, useRef, useEffect } from 'react';
import { useCookies } from 'react-cookie';

import { MdDelete } from "react-icons/md";
import { CiSquareRemove } from "react-icons/ci";
import "98.css"


const peopleCookieName = "savedPeople";
const E = 0.0000001;

type ItemType = {
  id: number;
  name:  string;
  price: number;
  split: number[];
}

function moneyFloor(x: number) {
  return Math.floor(x * 100) / 100;
}

function stringFromSplit(people: string[], split: number[]) {
  return people.map((person, index) => ((split[index] != 0) ? person + " " + split[index].toFixed(2) : "")).filter(person=>person!="").join(", ");
}

function ResultsBox({items, people} : {items: ItemType[], people: string[]}) {
  // const [totalCost, SetTotalCost] = useState<number>(0);
  // const [amounts, SetAmounts] = useState<number[]>([]);

  const amounts = people.map((person, personIndex)=>moneyFloor(items.reduce((acc, item)=>acc+item.split[personIndex]*item.price, 0)));
  // SetAmounts(amounts);
  const totalCost = items.reduce((acc, item)=>acc+item.price, 0);
  // SetTotalCost(totalCost);
  const amountsSum = amounts.reduce((acc,n)=>acc+n,0);
  const diff = totalCost - amountsSum;
  if (people.length && diff>0) {
    const done = Array(people.length).fill(false);
    for (let i = 0.00; Math.abs(i-diff)>E; i += 0.01) {
      let randomPersonIndex = -1;
      while (randomPersonIndex < 0 || done[randomPersonIndex] || amounts[randomPersonIndex]===0) randomPersonIndex = Math.floor(Math.random() * people.length);
      amounts[randomPersonIndex] += 0.01;
      console.log("0.01 added to " + people[randomPersonIndex]);
      done[randomPersonIndex] = true;
    }
  }
  

  return (
    <div className={styles.resultsWrapper}>
      {/* <div>{resultsAsString(items, people)}</div> */}
      <fieldset>
        <legend>Results</legend>
    <b>Total: ${totalCost.toFixed(2)}</b>
    <br /><br />
      <div className="status-bar">
        {people.map((person, personIndex)=>(
          <p className="status-bar-field" key={personIndex}>{person}: ${amounts[personIndex].toFixed(2)}</p>
        ))}
      </div>
      </fieldset> 
      {/* <h2>Results</h2> */}
      
    </div>
  )
}

function LogItem({people, item, deleteItem} : {people: string[], item: ItemType, deleteItem: () => void}) {

  return (<tr>
    {/* <td>{item.id}</td> */}
    <td>{item.name}</td>
    <td>${item.price.toFixed(2)}</td>
    <td>
      <div style={{display: "flex", justifyContent: "space-between", flexDirection: "row"}}>
        <p>{stringFromSplit(people, item.split)}</p>
        <MdDelete style={{color: "black", cursor: "pointer"}} onClick={()=>deleteItem()} />
      </div>
    </td>
  </tr>);
}

function TerminalBox({people, addItem} : {people: string[], addItem: (newItem: ItemType) => void}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function addItemFromText(formData: FormData) {
    const keyEntry = (formData.get("keyEntry") as string).trim();
    try {
      const [amount, namesabbr] = keyEntry.split(" ");
      const numamount = Math.floor(Number(amount) * 100) / 100; // round to nearest cent
      console.log(amount+ "," + namesabbr);
      if (isNaN(numamount) || namesabbr.length==0) {
        throw new Error("You messed up dog");
      }

      console.log("people: " + people);

      const peopleamounts = Array(people.length).fill(0);

      people.forEach((person, index) => {
        const initial = person[0].toLowerCase();
        // console.log("checking " + initial);
        const numMatches = (namesabbr.match(new RegExp(initial, "g")) || []).length;
        const split = (numMatches / namesabbr.length);
        peopleamounts[index] = split;
      });
      const noMatches = peopleamounts.reduce((acc, n)=>acc+n,0) !== 1;
      if (noMatches) {
        throw new Error("Enter names that exists");
      }
      const newItem: ItemType = {
        id: 0,
        name: "Mystery Item",
        price: numamount,
        split: peopleamounts
      }
      console.log(JSON.stringify(newItem));
      addItem(newItem);
    } catch (err) {
      alert(err);
    }

  }
  function peopleAreValid(people: string[]): boolean {
    const seen: { [id: string] : boolean; } = {}
    let valid = true;
    people.forEach(person=>{
      const personChar = person[0].toLowerCase();
      if (seen[personChar]) valid = false;
      else seen[personChar] = true;
    });
    return valid;
  }

  const valid = peopleAreValid(people);

  return (
    <div className={`${styles.terminalWrapper}`}>
      <div className={`${styles.terminalBox}`}>
        <strong>Enter (##.## xyz) to add items</strong>
        <form action={(data: FormData)=>{addItemFromText(data); if (inputRef.current) {inputRef.current.focus();}}}>
          <input ref={inputRef} type="text" name="keyEntry" disabled={!valid} defaultValue={!valid ? "To use this you must have unique initials" : ""}></input>
        </form>
      </div>
    </div>
  )
}

const examplePeople = ["Alice", "Bob", "James"];
export default function Home() {
  const [mounted, setMounted] = useState<boolean>(false);

  const [people, setPeople] = useState<string[]>(examplePeople);
  const [items, setItems] = useState<ItemType[]>([]);
  const [idCount, setIdCount] = useState<number>(0);

  const [cookies, setCookie, removeCookie] = useCookies([peopleCookieName]);


  useEffect(() => {
    if (!mounted && cookies.savedPeople) {
      setPeople(cookies.savedPeople);
      setMounted(true);
    }
  }, [mounted, setPeople, cookies.savedPeople]);

  useEffect(() => {
    const expiryDate = new Date(new Date().setFullYear(new Date().getFullYear() + 10));
    setCookie(peopleCookieName, JSON.stringify(people), { path: '/', expires: expiryDate });
  }, [people, setCookie]);

  function addItem(newItem: ItemType) {
    newItem.id = idCount;
    setItems([...items, newItem]);
    setIdCount(idCount+1);
  }
  function addItemFromForm(formData: FormData) {
    const peopleamount = people.reduce((acc: number, person) => acc + (formData.get(person) ? 1 : 0), 0);
    if (peopleamount == 0) {
      alert("U forgot to select someone");
      return;
    }

    const newItem: ItemType = {
      id: 0,
      name: formData.get("name") as string,
      price: Number(formData.get("price") as string),
      split: people.map((person) => {if (formData.get(person)) { return 1/peopleamount} else return 0; })
      };
    addItem(newItem);
  }

  function deleteItem(id: number) {
    setItems(items.filter(item=>item.id != id));
  }

  function addPerson(formData: FormData) {
    if (items.length != 0) { alert("You should clear the list first"); return; }
    const personName = formData.get("personName") as string
    if (people.indexOf(personName)!=-1) { alert("This person is already in the list"); return; }
    if (personName == "") return;
    setPeople([...people, formData.get("personName") as string]);
  }

  function deletePerson(personIndex: number) {
    if (items.length != 0) { alert("You should clear the list first"); return; }
    setPeople(people.filter((person, index)=>index != personIndex));
  }

  return (
    <div className={styles.page}>
      <div className={`window ${styles.mainBox}`}>
        <div className="title-bar">
          <div className="title-bar-text">Shopping Split</div>
          <div className="title-bar-controls">
            <button aria-label="Minimize"></button>
            <button aria-label="Maximize"></button>
            <button aria-label="Close"></button>
          </div>
        </div>
        <div className={styles.itemsWrapper}>
          <table>
            <thead>
              <tr style={{position:"sticky", top: 0}}>
                {/* <th>ID</th> */}
                <th>Name</th>
                <th>Price</th>
                <th>People</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: ItemType) => <LogItem key={item.id} people={people} item={item} deleteItem={()=>deleteItem(item.id)}/>)}
            </tbody>
          </table>
        </div>
        <hr></hr>
        <div className={styles.entryWrapper}>
          <div className={`sunken-panel ${styles.namesSelectorWrapper}`}>
            <form action={addPerson} style={{position:"sticky", top: 0}}>
              <input style={{width: "100%"}} name="personName" type="text"></input>
              <input type="submit" value="Add"></input>
            </form>
            {people.map((person, index) =>(
              <div key={person} className={styles.nameItem}><p>{person}</p><CiSquareRemove onClick={()=>deletePerson(index)} style={{color: "black", cursor: "pointer"}} /></div>
            ))}
          </div>
          <fieldset className={styles.itemAddForm}>
          <legend>Add Item</legend>
            <form action={addItemFromForm}>
              <div>
                <div>
                  <div className="field-row">
                    <label htmlFor="name">Item Name</label>
                    <input name="name" type="text"></input>
                  </div>
                  <div className="field-row">
                    <label htmlFor="price">Price</label>
                    <input name="price" type="number" step=".01"></input>
                  </div>
                </div>
                <div>
                  {people.map((person: string) => (<div key={person}>
                    <input name={person} id={person} value="yes" type="checkbox"></input>
                    <label htmlFor={person}> {person}</label>
                    </div>
                  ))}
                </div>
              </div>
              <input type="submit" value="Create"></input>
            </form>
          </fieldset>
        </div>
        <TerminalBox people={people} addItem={addItem}/>
        <ResultsBox items={items} people={people}/>
      </div>
    </div>
  );
}

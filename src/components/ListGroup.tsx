import { useState } from "react";

interface ListGroupProps {
    items: string[];
    heading: string;
}

function ListGroup({items, heading}: ListGroupProps) {
    
    // Hook
    const [selectedIndex, setSelectedIndex] = useState(-1);    
    
    // const getMessage = () => {
    //     return listItems.length === 0 ? "No items in list" : null;
    // }

    const handleClick = (e: MouseEvent) => console.log(e);

  return (
    <>
    <h1>List</h1>
    {/* {getMessage()} */}
    {items.length === 0 && <p>No items in list</p>}
    <h2>{heading}</h2>
    <ul className="list-group">
        {items.map((item, index) => (
            <li key={index} className={ selectedIndex === index ? 'list-group-item active' : 'list-group-item'} onClick={() => { setSelectedIndex(index) }}>
            {item}
            </li>
        ))}
    </ul>
    </>
  );
}

export default ListGroup;

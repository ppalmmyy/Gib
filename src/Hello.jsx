import { useState } from "react";
import './Hello.css';

function Item({ name, isPacked }) {
  return (
    <li>
      {isPacked ? name + '✅' : name}
    </li>
  );
}

export default function Hello() {
  const [count, setCount] = useState(0);
  const [value, setValue] = useState("type here!");

  const num = parseFloat(value);

  return (
    <>
      <ol>
        <Item name="flashlight" isPacked={true} />
        <Item name="sunglasses" />
        <Item name="towel" isPacked={true} />
      </ol>

      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <h1>you type {value.length} chars!</h1>

      {isNaN(num) ? (
        <h1>Please enter a number</h1>
      ) : (
        <h1>{num} Miles is {(num * 1.609344).toFixed(2)} Km</h1>
      )}

      <button onClick={() => setCount(count + 1)}> บวก </button>
      <button onClick={() => setCount(0)}> reset </button>
      <button onClick={() => setCount(count > 0 ? count - 1 : 0)}> ลบ </button>
      <p>You click {count} times</p>
    </>
  );
}

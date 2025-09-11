import { useState } from "react";
import "./List.css"; 

export default function List() {
  const [value, setValue] = useState("");

  const books = [
    { id: 1, title: "The Let Them Theory: A Life-Changing Tool That Millions of People Can't Stop Talking About", author: "Mel Robbins", image_url: "https://images-na.ssl-images-amazon.com/images/I/91I1KDnK1kL._AC_UL381_SR381,381_.jpg", price: 11.69 },
    { id: 2, title: "Forgotten Home Apothecary : 250 Powerful Remedies at Your Fingertips", author: "Dr. Nicole Apelian", image_url: "https://images-na.ssl-images-amazon.com/images/I/91-E86oM2IL._AC_UL381_SR381,381_.jpg", price: 37 },
    { id: 3, title: "Seven Things You Can't Say About China", author: "Tom Cotton", image_url: "https://images-na.ssl-images-amazon.com/images/I/81+mN748qkL._AC_UL381_SR381,381_.jpg", price: 19.58 },
    { id: 4, title: "Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones", author: "James Clear", image_url: "https://images-na.ssl-images-amazon.com/images/I/81ANaVZk5LL._AC_UL381_SR381,381_.jpg", price: 14.49 },
    { id: 5, title: "Sunrise on the Reaping (A Hunger Games Novel) (The Hunger Games)", author: "Suzanne Collins", image_url: "https://images-na.ssl-images-amazon.com/images/I/61o5Q8IIq4L._AC_UL254_SR254,254_.jpg", price: 19.17 },
    { id: 6, title: "I Wish Someone Had Told Me . . .: The Best Advice for Building a Great Career and a Meaningful Life", author: "Dana Perino", image_url: "https://images-na.ssl-images-amazon.com/images/I/81AOHbxGNfL._AC_UL254_SR254,254_.jpg", price: 20.3 },
    { id: 7, title: "How to Giggle: A Guide to Taking Life Less Seriously", author: "Hannah Berner", image_url: "https://images-na.ssl-images-amazon.com/images/I/81rO3vvG1mL._AC_UL254_SR254,254_.jpg", price: 20.29 },
    { id: 8, title: "Strangers in Time: A World War II Novel", author: "David Baldacci", image_url: "https://images-na.ssl-images-amazon.com/images/I/816QI0pfuRL._AC_UL254_SR254,254_.jpg", price: 17.84 }
  ];


  const filterList = books.filter(b =>
    b.title.toLowerCase().includes(value.toLowerCase()) ||
    b.author.toLowerCase().includes(value.toLowerCase())
  );

  return (
    <div className="book-page">
      <header className="book-header">
        <h1>Book List</h1>
        <input
          className="search-input"
          type="text"
          placeholder="ค้นหาชื่อหนังสือหรือผู้เขียน…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </header>

      {filterList.length === 0 ? (
        <p className="empty-state">ไม่พบหนังสือตามคำค้นหา</p>
      ) : (
        <ol className="book-grid">
          {filterList.map((b) => (
            <li key={b.id} className="book-card">
              <div className="book-thumb">
                <img src={b.image_url} alt={b.title} loading="lazy" />
              </div>
              <div className="book-body">
                <h3 className="book-title" title={b.title}>{b.title}</h3>
                <p className="book-author">By {b.author}</p>
                <p className="book-price">
                  ${b.price.toFixed(2)}
                </p>
              </div>
              <div className="book-actions">
                <button className="btn">Add to cart</button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

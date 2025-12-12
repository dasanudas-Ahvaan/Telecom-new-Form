import React, { useState, useEffect } from "react";
import useDebounce from "../hooks/useDebounce";

function Search({search, setSearch}) {
 

 
  return (
    <input
      type="text"
      className="border p-2"
      placeholder="Search…"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  );
}

export default Search;

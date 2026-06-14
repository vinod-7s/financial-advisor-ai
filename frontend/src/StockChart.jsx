const [watchlist, setWatchlist] = useState([]);

localStorage.setItem(
  "watchlist",
  JSON.stringify(watchlist)
);
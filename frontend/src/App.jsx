import { useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import { useRecommendation } from "./contexts/RecommendationContext";
import { updateCache } from "./updateCache.js";

import { gql } from "@apollo/client";

import {
  useMutation,
  useQuery,
  useSubscription,
  useApolloClient,
} from "@apollo/client/react";
import { all_books } from "./components/Books.jsx";

const login_user = gql`
  mutation loginUser($name: String!, $password: String!) {
    login(username: $name, password: $password) {
      value
    }
  }
`;

const find_user = gql`
  query {
    me {
      username
      favoriteGenre
    }
  }
`;

const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      title
      author {
        name
        id
      }
      published
      genres
      _id
      __typename
    }
  }
`;

const Notify = ({ errorMessage }) => {
  if (!errorMessage) {
    return null;
  }
  return <div style={{ color: "red" }}>{errorMessage}</div>;
};

const App = () => {
  const [page, setPage] = useState("login");
  const [errorMessage, setErrorMessage] = useState(null);
  const { setFavoriteGenre } = useRecommendation();
  const client = useApolloClient();

  const notify = (message) => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage(null);
    }, 10000);
  };

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const addedBook = data.data.bookAdded;
      console.log(data);
      alert(`Added the book: ${JSON.stringify(data.data.bookAdded.title)}`);
      updateCache(
        client.cache,
        { query: all_books, variables: { genre: null } },
        addedBook
      );
    },
  });

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(null);

  const [loginUser] = useMutation(login_user, {
    refetchQueries: [
      {
        query: find_user,
        fetchPolicy: "network-only",
      },
    ],
  });

  const userFound = useQuery(find_user);

  console.log("user", userFound);

  const login = async (event) => {
    event.preventDefault();
    try {
      const result = await loginUser({ variables: { name, password } });
      const tokenValue = result.data.login.value;
      console.log("tokenValue", tokenValue);
      setPage("books");
      setToken(tokenValue);
      localStorage.setItem("auth_token", tokenValue);
      setName("");
      setPassword("");
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const logout = () => {
    setToken(null);
    setPage("login");
    setFavoriteGenre(null);
    localStorage.clear();
  };

  const handleRecoClick = (event) => {
    event.preventDefault();
    setPage("recommendations");
    setFavoriteGenre(userFound.data.me.favoriteGenre);
  };

  const handleBookClick = (event) => {
    event.preventDefault();
    setPage("books");
    setFavoriteGenre(null);
  };

  if (!token && page === "login") {
    return (
      <>
        <div>
          <button onClick={() => setPage("authors")}>authors</button>
          <button onClick={() => setPage("books")}>books</button>
          <button onClick={() => setPage("login")}>login</button>
        </div>
        <form onSubmit={login}>
          <div>
            name{" "}
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div>
            password{" "}
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <button type="submit">submit</button>
        </form>
      </>
    );
  } else if (!token && page === "authors") {
    return (
      <>
        <div>
          <button onClick={() => setPage("authors")}>authors</button>
          <button onClick={() => setPage("books")}>books</button>
          <button onClick={() => setPage("login")}>login</button>
        </div>
        <Authors show={page === "authors"} />
      </>
    );
  } else if (!token && page === "books") {
    return (
      <>
        <div>
          <button onClick={() => setPage("authors")}>authors</button>
          <button onClick={() => setPage("books")}>books</button>
          <button onClick={() => setPage("login")}>login</button>
        </div>
        <Books show={page === "books"} />
      </>
    );
  } else if (token && page === "books") {
    return (
      <>
        <div>
          <button onClick={() => setPage("authors")}>authors</button>
          <button onClick={handleBookClick}>books</button>
          <button onClick={() => setPage("add")}>add book</button>
          <button type="button" onClick={handleRecoClick}>
            recommend
          </button>
          <button onClick={logout}>logout</button>
        </div>
        <Books show={page === "books"} />
      </>
    );
  } else if (token && page === "authors") {
    return (
      <>
        <div>
          <button onClick={() => setPage("authors")}>authors</button>
          <button onClick={handleBookClick}>books</button>
          <button onClick={() => setPage("add")}>add book</button>
          <button type="button" onClick={handleRecoClick}>
            recommend
          </button>
          <button onClick={logout}>logout</button>
        </div>
        <Authors show={page === "authors"} />
      </>
    );
  } else if (token && page === "add") {
    console.log(token);
    return (
      <>
        <div>
          <button onClick={() => setPage("authors")}>authors</button>
          <button onClick={handleBookClick}>books</button>
          <button onClick={() => setPage("add")}>add book</button>
          <button type="button" onClick={handleRecoClick}>
            recommend
          </button>
          <button onClick={logout}>logout</button>
        </div>
        <NewBook show={page === "add"} setError={notify} />
        <Notify errorMessage={errorMessage} />
      </>
    );
  } else if (token && page === "recommendations") {
    console.log("userFound", userFound);
    return (
      <>
        <div>
          <button onClick={() => setPage("authors")}>authors</button>
          <button onClick={handleBookClick}>books</button>
          <button onClick={() => setPage("add")}>add book</button>
          <button type="button" onClick={handleRecoClick}>
            recommend
          </button>
          <button onClick={logout}>logout</button>
        </div>

        <h2>recommendations</h2>
        <p>
          Books in your favourite genre{" "}
          <strong>{userFound.data.me.favoriteGenre}</strong>
        </p>
        <Books show={page === "recommendations"} />
      </>
    );
  }
};

export default App;

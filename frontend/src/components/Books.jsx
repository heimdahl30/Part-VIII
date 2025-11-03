import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useState, useEffect } from "react";
import { useRecommendation } from "../contexts/RecommendationContext";

export const all_books = gql`
  query findAnyBook($genre: String) {
    allBooks(genre: $genre) {
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

const Books = (props) => {
  if (!props.show) {
    return null;
  }

  const [genre, setGenre] = useState(null);
  const { favoriteGenre, setFavoriteGenre } = useRecommendation();

  useEffect(() => {
    if (favoriteGenre) {
      setGenre(favoriteGenre.toLowerCase());
    }
  }, [favoriteGenre]);

  console.log("fG", favoriteGenre);
  console.log("genre", genre);

  let books = [];
  const result = useQuery(all_books, {
    variables: { genre },
  });

  if (result.loading) {
    return <div>...loading</div>;
  } else {
    books = result.data.allBooks;
    if (favoriteGenre) {
      console.log("favorite", favoriteGenre);
      console.log("genre", genre);
      console.log("queryResult", books);
      return (
        <>
          <table>
            <tbody>
              <tr>
                <th></th>
                <th>author</th>
                <th>published</th>
              </tr>
              {books.map((a) => (
                <tr key={a.title}>
                  <td>{a.title}</td>
                  <td>{a.author.name}</td>
                  <td>{a.published}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      );
    } else {
      console.log("queryResult", books);
      return (
        <div>
          <h2>books</h2>
          <p>
            in genre <strong>{genre}</strong>
          </p>
          <table>
            <tbody>
              <tr>
                <th></th>
                <th>author</th>
                <th>published</th>
              </tr>
              {books.map((a) => (
                <tr key={a.title}>
                  <td>{a.title}</td>
                  <td>{a.author.name}</td>
                  <td>{a.published}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div>
            <button
              type="button"
              style={{ cursor: "pointer" }}
              onClick={() => setGenre("refactoring")}
            >
              refactoring
            </button>
            <button
              type="button"
              style={{ cursor: "pointer" }}
              onClick={() => setGenre("agile")}
            >
              agile
            </button>
            <button
              type="button"
              style={{ cursor: "pointer" }}
              onClick={() => setGenre("patterns")}
            >
              patterns
            </button>
            <button
              type="button"
              style={{ cursor: "pointer" }}
              onClick={() => setGenre("design")}
            >
              design
            </button>
            <button
              type="button"
              style={{ cursor: "pointer" }}
              onClick={() => setGenre("crime")}
            >
              crime
            </button>
            <button
              type="button"
              style={{ cursor: "pointer" }}
              onClick={() => setGenre("classic")}
            >
              classic
            </button>
            <button
              type="button"
              style={{ cursor: "pointer" }}
              onClick={() => setGenre(null)}
            >
              all genres
            </button>
          </div>
        </div>
      );
    }
  }
};

export default Books;

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useState } from "react";
import { useMutation } from "@apollo/client/react";

export const all_authors = gql`
  query {
    allAuthors {
      name
      born
      id
      bookCount
    }
  }
`;

const update_author = gql`
  mutation updateAuthor($selectedAuthor: String!, $born: String!) {
    editAuthor(name: $selectedAuthor, setBornTo: $born) {
      name
      born
    }
  }
`;

const Authors = (props) => {
  let authors = [];
  const result = useQuery(all_authors);
  const [updateAuthor] = useMutation(update_author, {
    refetchQueries: [{ query: all_authors }],
  });

  const [born, setBorn] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState("Robert Martin");

  const submit = async (event) => {
    event.preventDefault();
    console.log("update author...");
    updateAuthor({ variables: { selectedAuthor, born } });
    setSelectedAuthor("Robert Martin");
    setBorn("");
  };

  if (!props.show) {
    return null;
  }

  if (result.loading) {
    return <div>loading...</div>;
  } else {
    authors = result.data.allAuthors;
    console.log(result);

    return (
      <div>
        <h2>authors</h2>
        <table>
          <tbody>
            <tr>
              <th></th>
              <th>born</th>
              <th>books</th>
            </tr>
            {authors.map((a) => (
              <tr key={a.name}>
                <td>{a.name}</td>
                <td>{a.born}</td>
                <td>{a.bookCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h2>Set birthyear</h2>
        <form onSubmit={submit}>
          <label>
            <select
              value={selectedAuthor}
              onChange={(e) => setSelectedAuthor(e.target.value)}
            >
              {authors.map((a) => (
                <option key={a.name} value={a.name}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
          <div>
            born
            <input
              value={born}
              onChange={({ target }) => setBorn(target.value)}
            />
          </div>
          <button type="submit">update author</button>
        </form>
      </div>
    );
  }
};

export default Authors;

import { GraphQLError } from "graphql";
import Book from "./models/book.js";
import Author from "./models/author.js";
import User from "./models/user.js";
import jwt from "jsonwebtoken";

import { PubSub } from "graphql-subscriptions";
const pubsub = new PubSub();

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),

    allBooks: async (root, args) => {
      if (args.genre) {
        return Book.find({ genres: { $in: [args.genre] } }).populate("author");
      } else {
        return Book.find({}).populate("author");
      }
    },

    allAuthors: async () => Author.find({}),

    me: (root, args, context) => {
      if (!context.currentUser) {
        throw new Error("Authentication required.");
      }
      return context.currentUser;
    },
  },

  Author: {
    bookCount: async (root) => {
      return await Book.find({ author: root.id }).countDocuments();
    },
  },

  Mutation: {
    addBook: async (root, args, context) => {
      if (!context.currentUser) {
        throw new GraphQLError("User not authenticated", {
          extensions: {
            code: "UNAUTHENTICATED",
          },
        });
      }

      let existAuthor = await Author.findOne({ name: args.author });
      if (!existAuthor) {
        existAuthor = new Author({ name: args.author });
        await existAuthor.save();
      }
      const book = new Book({ ...args, author: existAuthor._id });
      try {
        await book.save();
      } catch (error) {
        throw new GraphQLError("Saving the book failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            error,
          },
        });
      }

      await book.populate("author");
      pubsub.publish("BOOK_ADDED", { bookAdded: book });
      return book;
    },

    editAuthor: async (root, args, context) => {
      if (!context.currentUser) {
        throw new GraphQLError("User not authenticated", {
          extensions: {
            code: "UNAUTHENTICATED",
          },
        });
      }

      const authorToEdit = await Author.find({ name: args.name }).exec();
      console.log("ATE", authorToEdit);
      if (authorToEdit.length > 0) {
        const authorObj = authorToEdit[0];
        authorObj.born = args.setBornTo;
        try {
          await authorObj.save();
        } catch (error) {
          throw new GraphQLError("Could not add birth year", {
            extensions: {
              code: "BAD_USER_INPUT",
              invalidArgs: args.name,
              error,
            },
          });
        }
        return authorObj;
      } else {
        return null;
      }
    },

    createUser: async (root, args) => {
      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre,
      });

      return user.save().catch((error) => {
        throw new GraphQLError("Creating the user failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            error,
          },
        });
      });
    },

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });

      if (!user || args.password !== "secret") {
        throw new GraphQLError("wrong credentials", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      };

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) };
    },
  },

  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterableIterator("BOOK_ADDED"),
    },
  },
};

export default resolvers;

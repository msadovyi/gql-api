const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const { generateName } = require('./utils');

const port = process.env.PORT || 3000;

const typeDefs = gql`
type Query {
  hello: String
  authors: [Author]!
  author(id: Int!): Author
  books: [Book]!
}
type Book {
  title: String!
  author: Author!
}
type Author {
  id: Int!
  fullName: String!
  books: [Book]!
}
`;

const books = [];
const authorsCount = 500;
const authors = Array.from({ length: authorsCount }, (_, i) => {
  const booksCount = 5
  const author = {
    id: i,
    fullName: generateName(),
  }
  const authorBooks = Array.from({ length: booksCount }, () => ({
    title: generateName(),
    author
  }));
  author.books = authorBooks;
  books.push(...authorBooks);
  return author;
})

const resolvers = {
  Query: {
    hello: () => 'Hello world!',
    books: () => books,
    authors: () => authors,
    author: (_, args) =>  authors[args.id],
  },
};

async function startApolloServer() {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();

  const app = express();
  server.applyMiddleware({ app, path: "/" });

  await new Promise(resolve => app.listen({ port }, resolve));
  console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`);
  return { server, app };
}

startApolloServer();
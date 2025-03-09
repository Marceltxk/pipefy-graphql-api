const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const axios = require('axios');

const app = express();

// Definindo o schema GraphQL
const typeDefs = gql`
  type Card {
    id: ID!
    title: String!
    description: String!
  }

  type Query {
    hello: String
  }

  type Mutation {
    createCard(pipeId: String!, title: String!, description: String!): Card
  }
`;

// Resolvers
const resolvers = {
  Query: {
    hello: () => "Hello, World!",
  },
  Mutation: {
    createCard: async (_, { pipeId, title, description }) => {
      // Substitua pelo seu token de acesso
      const pipefyToken = ' ';

      // Enviando requisição para a API GraphQL do Pipefy
      try {
        const response = await axios.post(
          'https://api.pipefy.com/graphql',
          {
            query: `
              mutation {
                createCard(input: {
                  pipe_id: "${pipeId}",
                  fields_attributes: [
                    { field_id: "title_field_id", field_value: "${title}" },
                    { field_id: "description_field_id", field_value: "${description}" }
                  ]
                }) {
                  card {
                    id
                    title
                    description
                  }
                }
              }
            `,
          },
          {
            headers: {
              Authorization: `Bearer ${pipefyToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        return response.data.data.createCard.card;
      } catch (error) {
        console.error(error);
        throw new Error("Error creating card");
      }
    },
  },
};

// Criando e aplicando o servidor Apollo
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.applyMiddleware({ app });

// Iniciando o servidor
app.listen(4000, () => {
  console.log('Servidor rodando em http://localhost:4000/graphql');
});

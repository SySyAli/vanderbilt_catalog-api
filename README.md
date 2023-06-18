# vanderbilt_catalog-api

This repository contains code that provides a GraphQL API and a search API using MeiliSearch. It also creates the Vanderbilt Course Catalog database using MongoDB and the Vanderbilt API. Fastify is used to create the server and Mercurius is used for to create the GraphQL endpoints.

## Installation

To install and run this project, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/your-repo.git
   ```

2. Install the dependencies:

   ```bash
   cd your-repo
   npm install
   ```

3. Set up the environment variables:
   - `MONGODB_URI`: MongoDB connection URI (default: `'mongodb://localhost:27017'`)
   - `PORT`: Server port (default: `3000`)
   - `MEILISEARCH_HOST`: MeiliSearch host URL (e.g., `'http://localhost:7700'`)

4. Set up MeiliSearch:
   - Install MeiliSearch following the instructions in the [official documentation](https://docs.meilisearch.com/guides/advanced_guides/installation.html). 
   - Start the MeiliSearch server using the appropriate command for your setup.

5. Start the server:

   ```bash
   npm start
   ```

   The server will start running on `http://localhost:3000`.

## API Endpoints

### GraphQL API

The GraphQL API allows you to interact with the course catalog. 

```
GET /graphql?query&operationName&variables
```
  - `query`, the GraphQL query.
  - `operationName`, the operation name to execute contained in the query.
  - `variables`, a JSON object containing the variables for the query.
  - The `operationName` and `variables` field are not need to be used  for this repo as there is not need to specify the type of operation and there are no variables need to specify for the query.
  - This information was taken from [Mercurius](https://mercurius.dev/#/docs/api/options?id=get-graphql)

### Course Schema:

```
    type Course {
        _id: ID!
        code: String!
        name: String!
        department: String!
        departmentAbbreviation: String!
        hours: String!
        description: String!
    }
```

### Query Types:

Below are the available query types:

#### `course(_id: ID!){fields}`

Fetches a single course by its ID.

Example request:

```
GET /graphql?query={course(_id: "123456789"){ _id, code, name, department, departmentAbbreviation, hours, description}}
```

#### `courses(code: String, name: String, department: String, departmentAbbreviation: String, hours: String, description: String)`

Fetches multiple courses based on the provided filters. If a field is not needed, do not send it in the request. No filters will fetch the entire database.

Request to fetch the entire database:

```
GET /graphql?query={courses(){ _id, code, name, department, departmentAbbreviation, hours, description}}
```

Example request with a filter:

```
GET /graphql?query={courses(department: "Chemistry"){ _id, code, name, department, departmentAbbreviation, hours, description}}
```

### Search API

The search API allows you to perform keyword-based searches on the course catalog using MeiliSearch.

#### `/search/:q`

Performs a search query on the course catalog.

Example request:

```
GET /search/cs
```

This will return courses related to "cs".

## Contributing

Contributions to this project are welcome. If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE). Feel free to use and modify the code as per the license terms.

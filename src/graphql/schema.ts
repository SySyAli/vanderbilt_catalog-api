const schema = `
    type Query {
        course(_id: ID!): Course!
        courses(code: String, 
                name: String, 
                department: String, 
                departmentAbbreviation: String, 
                hours: String, 
                description: String): [Course]!        
    }
    type Course{
        _id: ID!
        code: String!
        name: String!
        department: String!
        departmentAbbreviation: String!
        hours: String!
        description: String!
    }
`;

export default schema;
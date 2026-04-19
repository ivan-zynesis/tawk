## 3  Problem Statement – Message Management APIs

Build a set of APIs that handle message creation, retrieval, and search for each tenant.

The system should store the message as a document in mongodb and an index message in Elasticsearch for full text search. Kafka used to pass messages to asynchronous ingest messages to Elasticsearch.

**Message Schema**

type Message \= {

  id: string;           // ULID preferred

  tenantId: string;     // multi‑tenant boundary

  conversationId: string;

  senderId: string;

  body: string;

  timestamp: string;    // ISO8601

};

Required fields **must** be validated by the API layer.

## 4 Functional Requirements

### 4.1  Tech Stack

* **NestJS** for HTTP endpoints.  
* **MongoDB** as the primary data store.  
* **Kafka** for event publishing.  
* **Elasticsearch** for full‑text search.

### 4.2  API Endpoints

* POST /api/messages to create a new message.  
  * Validate input for required fields (conversationId, content).  
  * Store the message in MongoDB as the primary data store.  
  * Publish message events to the broker.  
* GET /api/conversations/:conversationId/messages to retrieve messages for a conversation.  
  * Support pagination and sorting.  
* GET /api/conversations/:conversationId/messages/search?q=term for searching messages.  
  * Implement full-text search using Elasticsearch.  
  * Define and configure appropriate Elasticsearch mappings to ensure efficient search performance.

### 4.3 Data Model & Indexing

### 4.4 Event Handling & Messaging

* Publish message creation events to Kafka.  
* Implement a subscriber to process and index messages into Elasticsearch.  
* Design Kafka topics, partitions, and consumer groups for scalability and fault tolerance.

### 4.5  Code Quality

* Follow SOLID principles.  
* Write both unit tests and API integration tests.  
* Provide a comprehensive README with setup instructions and architecture decisions.

### 4.6  Security

* Validate and sanitize inputs.  
* Implement basic authentication and authorization (optional).

### 4.7 Performance

* Optimize database queries.  
* Implement caching (optional).

### 

* **Tech Stack:**  
  * Use NestJS for building RESTful APIs.  
  * MongoDB as the primary data store.  
  * Kafka for message brokering.  
  * Elasticsearch for search functionality.  
* **API Endpoints:**  
  *   
* **Data Model & Indexing:**  
  * **Message Type Example:**

type Message \= {  
  id: string;  
  conversationId: string;  
  senderId: string;  
  content: string;  
  timestamp: Date;  
  metadata?: Record\<string, any\>;  
};

* Message schema with fields: id, conversationId, content, timestamp.  
  * Ensure efficient indexing for search and retrieval.  
  * Define appropriate MongoDB indexes for optimized query performance.  
* 

### **Non-Functional Requirements**

#### **Performance & Scalability:**

* Efficient MongoDB retrieval with proper indexing.  
* Optimize database queries and consider caching.

#### **Reliability & Security:**

* Ensure message delivery guarantees.  
* Validate and sanitize inputs.  
* Implement basic authentication and authorization.

#### **Code Quality & Best Practices:**

* Follow SOLID principles.  
* Adhere to DDD practices.  
* Implement both unit tests and integration tests covering key functionalities and edge cases.  
* Handle multi-tenancy effectively.  c
* Optimize data structures.

Title
Deciding on our database 

Context & problem statement
To manage information like member details, the media catalogue, borrow and return operations, and search history, the library management system needs a database solution. The database must be efficient for querying data without requiring a lot of scalability, be lightweight, be affordable, and be simple to set up. The choice is between SQLite and alternative databases like MySQL, PostgreSQL, or a NoSQL solution, taking into account the requirements of the library and available resources.


Considered option
We considered MySQL; it is a more powerful SQL database that frequently needs management and setup on a dedicated server. Although there are a lot of positives with MySQL, it is more beneficial for a larger application, and the project isn't that large to use a database of that magnitude.

Another alternative database we considered was NoSQL (e.g., MongoDB). it is excellent for unstructured data but not the greatest option for structured data, such as transaction records and media in libraries, so that's why we were a bit hasty in choosing this as our designated database.


Decision Outcome 
SQLite was selected as the database for the library management system after the possibilities were evaluated. SQLite is a cost-effective and effective alternative for managing the library's data since it offers the perfect blend of ease of use, minimal setup, and maintenance needs.

Consequences
All data will be stored in a single SQLite file by the library management system, guaranteeing portability and low setup requirements. This option offers sufficient performance for a single-user or limited-access system, but it restricts concurrent access (fit for smaller environments). Because SQLite requires less ongoing maintenance, the team may concentrate on application development rather than database administration.

Pros and Cons of the Options 
The advantages of SQLite include its low setup costs, serverless architecture, ease of integration, low maintenance requirements, and lightweight nature.

Cons: Inadequate for large-scale applications requiring high write concurrency; limited concurrent access.

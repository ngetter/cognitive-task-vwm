from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from databases import Database
from sqlalchemy import create_engine, MetaData, Table, Column, String, Integer

# Initialize the database connection
DATABASE_URL = "sqlite:///./results.db"
database = Database(DATABASE_URL)
metadata = MetaData()

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
async def root():
    return {"message": "Hello World"}


# Define the table structure
# Assume 'filedata' is an array of dictionaries, each with the same structure
async def create_results_table_if_needed(data):
    columns = [Column("id", Integer, primary_key=True)]
    columns += [Column(key, String) for key in data[0].keys()]

    results_table = Table("results", metadata, *columns, extend_existing=True)
    engine = create_engine(DATABASE_URL)
    metadata.create_all(engine)
    return results_table

@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

@app.post("/write_data")
async def write_data(request: Request):
    data = await request.json()
    filedata = data.get("filedata")
    print(filedata)
    trials = [1] 
    trials += filedata['trials']
    if isinstance(trials, list) and len(trials) > 0:
        # Dynamically create the table based on the first element's keys
        results_table = await create_results_table_if_needed(trials)
        # Insert data into the table
        query = results_table.insert().values(trials)
        await database.execute(query)

    return {"status": "success", "received_data": filedata}
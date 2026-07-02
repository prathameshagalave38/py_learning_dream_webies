from fastapi import FastAPI, HTTPException
from pydantic import BaseModel


app = FastAPI()


@app.get("/")
def home():
    return {"message": "backend running"}




students ={
    1:{"name":"prathamesh" , "age":"19"},
    2:{"name":"radheshyam","age":"19"}
}

@app.get("/student/{stu_id}")
def show_studnt(stu_id : int):
    if stu_id not in students:
        raise HTTPException(status_code=404, detail="student not found")
    return students[stu_id]

@app.get("/all")
def show_all():
    return students

class students_details(BaseModel):
    id : int
    name : str
    age : int

@app.post("/details")
def stud_data(stud_id : int , studentdata : stud_data ):
    students[stud_id] = studentdata.dict()
    return studentdata
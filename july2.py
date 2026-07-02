from fastapi import FastAPI, HTTPException

app = FastAPI()

@app.get("/")
def home():
    return {"message": "backend running"}




students ={
    1:{"name":"prathamesh"},
    2:{"name":"radheshyam"}
}

@app.get("/student/{stu_id}")
def show_studnt(stu_id : int):
    if stu_id not in students:
        raise HTTPException(status_code=404, detail="student not found")
    return students[stu_id]
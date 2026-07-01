#python packages and vertual envirofrom

from fastapi import FastAPI

app = FastAPI()

@app.get("/name")
def show():
    return {"message" : "server started "}


@app.get("/name/prathamesh")
def show():
    name = "prathamesh"
    surname = "agalave"
    return {"message" :"my name is :" + name + "  "  +  surname}



@app.get("/name/prathamesh/info")
def show():
    clg = "gramin tecnhical management campus"
    year = "3rd year"
    return  ( "prathamesh from :" + clg +  "  " + " purseving diploma in :" + year )


@app.get("/name/radheshyam")
def show():
    name = "radheshyam"
    surname = "karale"
    return {"message" :  "my name is :" +  name  +"  "  +  surname } 

@app.get("/name/radheshyam/info")
def show():
    clg = "gramin tecnhical management campus"
    year = "3rd year"
    return  ( "radheshyam from :" + clg +  "  " + " purseving diploma in :" + year )
# task 6 fastapi task 

from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def show():
    return {"message" : "wellcome to server "}


@app.get("/about")
def show():
    name = "prathamesh"
    surname = "agalave"
    return {"message" :"my name is :" + name + "  "  +  surname}



@app.get("/college")
def show():
    clg = "gramin tecnhical management campus"
    year = "3rd year"
    branch = "co"
    return  ( "prathamesh from :" + clg +  "  " + " purseving diploma in :" + year + "in " + branch + "branch" )


@app.get("/skill")
def show():
    
    return {"skills" : " python , git , github , programing , problem solving" } 

@app.get("/fruites")
def show():
    fruites = ["apple","banana","mango","stobary"]
    return  fruites

@app.get("/profile")
def show():
    profile = {
        "name":"prathamesh",
        "age":"19",
        "city":"nanded"
    }
    return  profile


@app.get("/team")
def show():
    team = [
        {
            "name":"radheshyam",
            "age":"19",
            "branch":"co"
        },

        {
           "name":"rushikesh",
            "age":"19",
            "branch":"co" 
        },
         {
           "name":"bajrang",
            "age":"20",
            "branch":"co" 
        }
    ]

    return  team

@app.get("/subjects")
def show():
    subjects = ["OS","SE"]
    return  subjects


@app.get("/languages")
def show():
    languages = ["c","c++","java","python","html","css"]
    return  languages












# from fastapi import FastAPI

# app = FastAPI()

# @app.get("/")
# def show():
#     return {"message" : "wellcome to server "}


# @app.get("/about")
# def show():
#     name = "prathamesh"
#     surname = "agalave"
#     return {"message" :"my name is :" + name + "  "  +  surname}



# @app.get("/about/college")
# def show():
#     clg = "gramin tecnhical management campus"
#     year = "3rd year"
#     branch = "co"
#     return  ( "prathamesh from :" + clg +  "  " + " purseving diploma in :" + year + "in " + branch + "branch" )


# @app.get("/about/colleg/skill")
# def show():
    
#     return {"skills" : " python , git , github , programing , problem solving" } 

# @app.get("/about/colleg/skill/fruites")
# def show():
#     fruites = ["apple","banana","mango","stobary"]
#     return  fruites

# @app.get("/about/colleg/skill/fruites/profile")
# def show():
#     profile = {
#         "name":"prathamesh",
#         "age":"19",
#         "city":"nanded"
#     }
#     return  profile


# @app.get("/about/colleg/skill/fruites/profile/team")
# def show():
#     team = [
#         {
#             "name":"radheshyam",
#             "age":"19",
#             "branch":"co"
#         },

#         {
#            "name":"rushikesh",
#             "age":"19",
#             "branch":"co" 
#         },
#          {
#            "name":"bajrang",
#             "age":"20",
#             "branch":"co" 
#         }
#     ]

#     return  team

# @app.get("/about/colleg/skill/fruites/profile/team/subjects")
# def show():
#     subjects = ["OS","SE"]
#     return  subjects


# @app.get("/about/colleg/skill/fruites/profile/team/subjects/languages")
# def show():
#     languages = ["c","c++","java","python","html","css"]
#     return  languages
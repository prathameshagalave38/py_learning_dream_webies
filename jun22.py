#oop 

# class google :
#    empN = 100
#    empS = 10000

# obj = google()


# print(obj.empN)
# print(obj.empS)










# class google :
#     def show(self ,empN ,empS):
#         self.empN1 = empN
#         self.empS1 = empS
#     def display(self):
#         print(self.empN1 , self.empS1)    
        

# obj = google()

# obj.show("prathamesh",1000)
# obj.display()












# class cs :
#     def show(self):
#         self.info = {
#              "name":"prathamesh",
#              "year":"3rd",
#              "dept":"co"
#             }
#     def display(self):
#         print(self.info)



# obj = cs()

# obj.show()
# obj.display()





# #constructure 
# class android:
#     def __init__(self, googleAGE, numberAGE):
#         if googleAGE >= 18 and numberAGE >= 18 :
#             print("test pass")
#         else:
#             print("not pass")

# obj = android( 18 ,18)



# inheritance

class a :
    def show (self, name , age):
        self.name1=name
        self.age1=age
        print(self.name1 , self.age1)

class b(a):
    pass

class c(b):
    pass


obj = c()

obj.show("prathamesh", 18)
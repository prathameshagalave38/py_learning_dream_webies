# adding/ iNSERT item in list 


#BY APPEND 
thislist = ["prathamesh", "sandesh", "002"]
print(thislist)
# thislist.append("agalave") #add to last 
# print(thislist)


#BY INSERT
thislist2 = ["sandesh", "prathamesh", "004","samay"]
print(thislist2)

#print("   ")
# if "samay" in thislist2 :
#     print("samay is prasant")
#     thislist2[3] = "prathamesh"
# print(thislist2)


#print("   ")
# print(thislist2)
# thislist2.insert(1, "agalave")
# thislist2[2] = "i am" 
# print(thislist2)

#print("   ")
#extent list
# thislist2.extend(thislist)
# print(thislist2)





#REMOVE ITEM
# thislist2.remove("prathamesh")
# #thislist2.remove("004")
# thislist2.pop(1)
# print(thislist2)




#SORT LIST
# thislist2.sort()
# print(thislist2)




#REVERSE SORT
# thislist2.sort(reverse = True)
# print(thislist2)




#COPY LIST


# mylist =thislist2.copy()
# print(mylist)






#JOINING LIST
# thislist3 = thislist + thislist2

# print(thislist3)




#task list creatr and chack 

list = ["prathamesh","sandesh","raj","007","374","ram","shyam","radha"]
list2 = ["pratham"]
print(list)
if "raj" in list:
    print("raj is present in list")

list[2] = "ram"
print(list)
list.append("pratham")
print(list)


list.insert(1,"shyam")
print(list)


list.extend(list2)
print(list)

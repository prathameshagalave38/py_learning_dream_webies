#LIST 

# name = ["prathamesh ", " : 34", "sandesh"]

# print(name)


# name2 = ["prathamesh","002","092.8"]

# #list starts form 0 
# print(name2)

# print(name2[0])
# print(name2[1])
# print(name2[2])
# #print(name2[3]) this out of bound 



# print(type(name2))
# print(type(name))




# #printing list REGULAR AND REVERSE

# list = ["prathamesh","093","0.29","true"]

# print(list)

# print("regular")

# print("this is index 0 : " , list[0]) # zero always remains
# print("this is index 1 : " , list[1])
# print("this is index 2 : " , list[2])
# print("this is index 3 : " , list[3])

# print("reverse")


# print("this is index -0 : " , list[-0]) # zero always remains
# print("this is index -1 : " , list[-1])
# print("this is index -2 : " , list[-2])
# print("this is index -3 : " , list[-3])
# print("this is index -4 : " , list[-4])



#SLICING SULECTING SPACIFIC PART

thislist = ["prathamesh", "sandesh", "007", "45", "shrau", "raj", "mango"]
print(thislist[0:7])
print(thislist[-1] )


print("   ")


list2 = ["apple", "banana", "cherry", "orange", "kiwi", "melon", "mango"]
print(list2[:4]) # start form 0
print(list2[2:]) #print from 2 to next all


print("   ")
list = ["raj", "008", "0.6", "orange", "kiwi", "rohit", "sahrma"]
print(list[-4:-1])


print("   ")

print("searching")
list3 = ["prathamesh", "sandesh", "007", "45", "shrau", "raj", "mango"]
if "45" in list3 :
    print("45 is present")
print(len(list3))



print("   ")

print("   ")





print("changing item : ")
list4 = ["prathamesh", "sandesh", "007", "45", "shrau", "raj", "mango"]
list4[2] = "prathamesh"
print(list4)
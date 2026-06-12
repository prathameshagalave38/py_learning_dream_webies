# #Logical Operators

# #AND

# x = 5

# print(x > 0 and x < 10)

# x = 55

# print(x > 0 and x < 10)


# #OR


# x = 5

# print(x < 5 or x > 4)

# x = 5

# print(x < 5 or x > 10)



# #NOT

# x = 5

# print(not(x > 3 and x > 10))



# # TASK IN CLASS 

# a= 6 

# b = 8


# print(a > b and b < a) 
# print(a >=b and b <= a) 
# print(a == b and b == a) 

# print(a > b or b < a) 
# print(a < b or b > a) 
# print(a >=b or b <= a) 
# print(a == b or b == a) 

# print(not (a > b or b < a)) 
# print(not (a < b or b > a) )
# print(not (a >=b or b <= a) )
# print(not (a == b or b == a) ) 


#identity opreter


# IS


# x = ["prathamesh", "agalave"]
# y = ["prathamesh", "agalave"]
# z = x

# print(x is z)

# # returns True because z is the same object as x

# print(x is y)

# # returns False because x is not the same object as y, even if they have the same content

# print(x == y)

# # to demonstrate the difference betweeen "is" and "==": this comparison returns True because x is equal to y






# # IS NOT

# x = ["apple", "banana"]
# y = ["apple", "banana"]
# z = x

# print(x is not  z)

# # returns True because z is the same object as x

# print(x is not  y)

# # returns False because x is not the same object as y, even if they have the same content

# print(x != y)

# # to demonstrate the difference betweeen "is" and "==": this comparison returns True because x is equal to y


name = ["prathamesh", "sandesh", "ram","raj" , "samarth"]

print("sandesh" in name)
print("nitin" in name)
print("samarth" in name)

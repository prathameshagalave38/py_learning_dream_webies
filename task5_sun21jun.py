#task 1 loop 
# Question 1: Daily Sales Total
# Description: A shop records sales for N days. Find the total sales using loops only.
# Input: Define suitable input.
# Output: Produce the required result.
# Constraint: Use the topic concepts properly and write clean logic.



# # Number of days
# n = int(input("Enter number of days: "))

# total = 0

# for i in range(1, n + 1):
#     sale = float(input("Enter sales for day : "))
#     total = total + sale

# print("Total Sales =", total)







# Question 2: ATM Transaction Counter
# Description: Given N transactions, count how many are deposits and withdrawals.
# Input: Define suitable input.
# Output: Produce the required result.
# Constraint: Use the topic concepts properly and write clean logic.



n = int(input (" enter your Transaction :"))
withdrawals = 0
deposits = 0 


for i in range (1, n + 1):
    wtype = (input("enter your Transaction type 'w' for withdrawals & D for deposits : "))
    if wtype == "w":
        withdrawals += 1
    else:
        deposits += 1


print("all deposits are : " , deposits)
print("all withdrawals are : " , withdrawals)


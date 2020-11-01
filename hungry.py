#! python
import sys
import numpy as np

class Man:
    def __init__(self, name):
        self.name = name
        print("Initialized!")

    def hello(self):
        print("Hello " + self.name + "!")

    def goodbye(self):
        print("Good-bye " + self.name + "!")


sys.stdout.write("hello from Python %s\n" % (sys.version,))

print("I'm hungry!'")

m = Man("David")
m.hello()
m.goodbye()

x = np.array([1.0, 2.0, 3.0])
y = np.array([2.0, 4.0, 6.0])
print(x)
print("x + y: ", x + y)
print("x - y: ", x - y)
print("x * y: ", x * y)
print("x / y: ", x / y)
print("x / 2.0: ", x / 2.0)

A = np.array([[1, 2], [3, 4]])
print(A)
print(A.shape)
print(A.dtype)
B = np.array([[3, 0], [0, 6]])
print("A + B: ", A + B)
print("A * B: ", A * B)
print("A * 10: ", A * 10)

A1 = np.array([[1, 2], [3, 4]])
B1 = np.array([10, 20])
print("A1 * B1: ", A1 * B1)

X = np.array([[51, 55],[14, 19], [0, 4]])
print("X:",X, " X[0]:", X[0], "X[0][1]:",X[0][1])

X1 = X.flatten()
print("X.flatten X1:", X1)
print("X.flatten X1 > 15:", X1 > 15)
print("X.flatten X1[X1 > 15]:", X1[X1 > 15])


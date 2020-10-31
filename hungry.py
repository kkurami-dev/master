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


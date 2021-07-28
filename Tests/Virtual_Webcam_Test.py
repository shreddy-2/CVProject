#Quick test to show that a virtual webcam can be created to show what I want
#in this case test_image.jpg
#Run this code, then open a video call in any app and select OBS as the webcam
#You should see the test image instead of your own webcam footage

import pyvirtualcam
import numpy as np
import cv2 as cv

#Create virtual cam
with pyvirtualcam.Camera(width=640, height=480, fps=20) as cam:
  print("Using virtual camera: ", cam.device)
  #Import image test_image.jpg
  img = cv.imread("test_image.jpg")
  #Resize image to 640X480, the same resolution as the virtual cam
  frame = cv.resize(img, (640, 480))

  #Send image as webcam every frame
  while True:
    cam.send(frame)
    cam.sleep_until_next_frame()

#Sometimes there's this weird error where the output is three images stacked next to each other
#Quitting and rerunning the code with no changes fixes it
#I have no idea what this error is how to fix it
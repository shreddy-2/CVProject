#Quick test to show that the screen can be captured
#Use bouding_box to select the area of the screen to be captured, it will show in pop-up
#Seems to have very good frame rate

import numpy as np
import cv2
from mss import mss

#Selects area of screen to be captured, in the shape of a rectangle
#'top' and 'left' change position of rectangle
#'width' and 'height' determine size of rectangle
bounding_box = {'top' : 100, 'left' : 0, 'width' : 400, 'height' : 300}

#Create screen capture
sct = mss()

while True:
  #Grab a frame of screen
  sct_img = sct.grab(bounding_box)
  
  #Show frame
  cv2.imshow('screen', np.array(sct_img))

  #Exit on key press
  if cv2.waitKey(1) == ord('q'):
    cv2.destroyAllWindows()
    break

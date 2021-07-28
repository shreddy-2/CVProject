#Quick proof of concept to show that background replacement can be done quite easily
#Basically stolen from this article https://www.analyticsvidhya.com/blog/2021/07/learn-how-to-do-real-time-background-replacement-using-opencv-and-cvzone/

import cv2 as cv
import cvzone
from cvzone.SelfiSegmentationModule import SelfiSegmentation

#Capture video from webcam (source 0)
cap = cv.VideoCapture(0)

#Create segmentor for separating background
segmentor = SelfiSegmentation()

#Error handling if camera cannot be opened
if not cap.isOpened():
  print("Camera cannot be opened")
  exit()

#Display webcam footage
while True:
  #Capture frames from webcam
  #No idea what ret means but it seems to be a convention
  ret, webcam_frame = cap.read()

  #If frame cannot be read, ret is false
  if not ret:
    print("Frame cannot be read")
    print("Exiting...")
    break

  #Operations on frame go here
  bg = (213, 226, 227)    #Background, in this case RGB colour
  #Removes webcam background and replaces with our background
  final_frame = segmentor.removeBG(webcam_frame, bg, 0.8)   

  #Display final frame
  cv.imshow('frame', final_frame)

  #Exit from loop on user command
  if cv.waitKey(1) == ord('q'):
    print("Exiting...")
    break

#When finished, release capture
cap.release()
cv.destroyAllWindows()
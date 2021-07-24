import cv2 as cv
import cvzone
from cvzone.SelfiSegmentationModule import SelfiSegmentation
import pyvirtualcam

width = 640
height = 480
background = (213, 226, 227) # Background RGB colour

def run():
    segmentor = SelfiSegmentation() # Separate the background
    camera_in = cv.VideoCapture(0)
    if not camera_in.isOpened():
        print("Camera cannot be opened")
        exit()

    camera_out = pyvirtualcam.Camera(width=width, height=height, fps=20)
    print("Using virtual camera: ", camera_out.device)

    #Capture camera_in footage, display, resize and re-broadcast
    while True:
        ret, frame = camera_in.read()
        if not ret:
            print("Unable to read frame, exiting")
            break

        frame = segmentor.removeBG(frame, background, 0.8)
        cv.imshow('frame', frame)

        frame = cv.resize(frame, (width, height))
        camera_out.send(frame)

        #Exit from loop on user command 
        if cv.waitKey(1) == ord('q'): 
            print("Exiting...") 
            break

        camera_out.sleep_until_next_frame()

    # When finished, release capture
    camera_in.release()
    cv.destroyAllWindows()

#====
run()


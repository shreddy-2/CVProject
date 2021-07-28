#WORK IN PROGRESS

#Test to create an overlay window
#Taken from this tutorial https://hasenj.wordpress.com/2009/04/14/making-a-fancy-window-in-wxpython/

import wx

#Create overlay as class
class Overlay(wx.Frame):
    def __init__(self):
      #Style window, i.e. always on top, no border etc.
      style = ( wx.CLIP_CHILDREN | wx.STAY_ON_TOP | wx.NO_BORDER | wx.FRAME_SHAPED)
      #Create frame
      wx.Frame.__init__(self, None, title='Overlay', style = style)
      #Quit on key press
      self.Bind(wx.EVT_KEY_UP, self.OnKeyDown)
      #Make window draggable
      self.Bind(wx.EVT_MOTION, self.OnMouse)

      #Show frame
      self.Show(True)

    #Create event handler to quit on key press
    def OnKeyDown(self, event):
      if event.GetKeyCode() == ord('Q'):
        self.Close(force=True)
      else:
        event.Skip() 

    #Create event handler for dragging
    def OnMouse(self, event):
      if not event.Dragging():
        self._dragPos = None
        return    
      self.CaptureMouse()
      if not self._dragPos:
        self._dragPos = event.GetPosition()
      else:
        pos = event.GetPosition()
        displacement = self._dragPos - pos    
        self.SetPosition(self.GetPosition() - displacement)
        

app = wx.App()
f = Overlay()
app.MainLoop()
# Connecting USB devices

Use these steps for any USB device you want to use inside the VM.

## UTM

1. Plug the device into your computer.
2. Start the VM.
3. Click the **USB Devices** icon in the top-right corner of the VM window.
4. Choose your device, then click **Connect…**.

For the Nandland Go Board, choose **Dual RS232-HS**. Inside the VM, run
USButils and look for **Dual UART / FIFO IC**.

If the device does not show up in UTM, shut down the VM. In UTM, select the
VM, click **Edit**, open **Input**, and tick **Share USB devices from host**.

<video controls playsinline preload="metadata" style="max-width: 100%; border-radius: 8px;">
  <source src="/videos/utm-go-board-usb-sharing.mp4" type="video/mp4">
  Your browser does not support embedded video.
</video>

## VirtualBox

1. Plug the device into your computer.
2. Start the VM.
3. Click the USB icon in the bottom toolbar at the lower-right of the virtual
   machine window.
4. Choose the device from the list.

For the Nandland Go Board, choose **FTDI Dual RS232-HS**. Inside the VM, run
USButils and look for **Dual UART / FIFO IC**.

<video controls playsinline preload="metadata" style="max-width: 100%; border-radius: 8px;">
  <source src="/videos/virtualbox-go-board-usb-sharing.mp4" type="video/mp4">
  Your browser does not support embedded video.
</video>

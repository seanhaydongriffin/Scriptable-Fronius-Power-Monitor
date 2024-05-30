# Scriptable-Fronius-Power-Monitor
A Scriptable script for realtime monitoring of Fronius Power Inverters

![image](https://github.com/seanhaydongriffin/Scriptable-Fronius-Power-Monitor/assets/28795922/7762cd83-94a8-4244-babd-50e31eeb669f)


## Requirements
- an iOS device (ie. iPhone or iPad)
- the [Scriptable app](https://scriptable.app)

## How to Install
1. if you haven't done so install the **Scriptable app** from the App Store (see [https://scriptable.app](https://scriptable.app))
2. download the file named **froniusPowerMonitor.js** from [Releases](https://github.com/seanhaydongriffin/Scriptable-Fronius-Power-Monitor/releases/latest)
3. on the iOS device (ie. iPhone or iPad) copy the content of this file to your clipboard
   - for example open the downloaded file from Safari
   - tap the **Share** button
   - tap **Copy**
4. open the **Scriptable app**
5. in **Scripts** tap the **Add** button
6. in the Untitled Script tap then in the menu tap **Paste** (the content of the "froniusPowerMonitor.js" file should be visible in this new Untitled Script)
7. tap **Untitled Script** to give the script a name
8. to test the script starts tap the **Run** button to run the script (then **Close** button to stop it)
9. tap **Done** to close and save the script

## How to Use
When you run the script it presents you with a page of charts.

On first use the charts will likely be blank because the script cannot locate the inverter ...

![image](https://github.com/seanhaydongriffin/Scriptable-Fronius-Power-Monitor/assets/28795922/f4e9fdab-672b-4292-93b7-56e2395f47d4)

Tap the **Configuration** tab and in the **Inverter IP Address** field enter the IP address of your inverter ...

![image](https://github.com/seanhaydongriffin/Scriptable-Fronius-Power-Monitor/assets/28795922/26df895f-86ff-462e-b467-2fcfedc90eb3)

If you enter the correct IP address you should see a tick (as above).  Tap the **Realtime Charts** tab and now the charts should be updating ...

![image](https://github.com/seanhaydongriffin/Scriptable-Fronius-Power-Monitor/assets/28795922/a62b3a68-b84d-4a70-b6b1-401cd478c7ae)

To save your IP address edit this script in Scriptable and on line #1 of the script change the IP address to your own then tap **Done**.

## Why a Scriptable script?

#include <iostream>
#include <fstream>
#include <string>
#include <cctype>
#include <cstdlib>

using namespace std;

// Helper function to convert string to lowercase
string toLower(string str)
{
    for (auto &c : str)
        c = tolower(c);
    return str;
}

int main()
{
    cout << "\t\t\t FOOD MENU" << endl;
    cout << "\t\t\t------------" << endl;

    string user, js, sh, wr, tc;
    int mc = 0, ch = 0, pm1 = 0;
    char pm = 'n';
    char wraps, tacos, juices, shakes;
    double drinkPrice = 0, mainCoursePrice = 0, totalBill = 0;
    ofstream file;

    file.open("food_order.txt", ios::app);
    if (!file)
    {
        cerr << "Unable to open food_order.txt for writing." << endl;
        return 1;
    }

    cout << "enter your name: ";
    // getline(cin, user);
    file << "Customer Name: " << user << endl;
    if (user.empty())
    {
        getline(cin, user);
    }

    cout << "\n";
    cout << "Welcome to Taco Bell " << user << "!" << endl;
    cout << "\t\t\t MENU " << endl;

    cout << "what would you like to have?" << endl;
    cout << "juices or shakes (press 1 for juices and 2 for shakes): ";
    if (!(cin >> ch))
        return 0;
    if (ch == 1)
    {
        cout << "JUICES MENU" << endl;
        cout << "------------" << endl;

        string juiceNames[] = {"Pineapple lime", "Cranberry crush", "Mango peach", "Dragonfruit berry"};
        int juicePrices[] = {159, 189, 179, 199};
        int juiceCount = 4;

        for (int i = 0; i < juiceCount; i++)
        {
            cout << (i + 1) << ". " << juiceNames[i];
            cout << ":" << juicePrices[i] << "/-" << endl;
        }

        cout << "which juice would you like to have?: ";
        cin >> ws;
        getline(cin, js);

        // Convert to lowercase for case-insensitive matching
        string jsLower = toLower(js);
        bool juiceFound = false;
        int choice = -1;

        // Try numeric match first
        try
        {
            choice = stoi(jsLower);
            if (choice >= 1 && choice <= juiceCount)
            {
                drinkPrice = juicePrices[choice - 1];
                juiceFound = true;
                js = juiceNames[choice - 1]; // Update js to actual name
            }
        }
        catch (...)
        {
            // Not a number, try name matching
        }

        // If not found, try name matching (case-insensitive)
        if (!juiceFound)
        {
            for (int i = 0; i < juiceCount; i++)
            {
                if (jsLower.find(toLower(juiceNames[i])) != string::npos)
                {
                    drinkPrice = juicePrices[i];
                    juiceFound = true;
                    js = juiceNames[i]; // Update js to actual name
                    break;
                }
            }
        }

        if (!juiceFound)
        {
            cout << "Invalid juice selection! Please enter a number (1-4) or juice name." << endl;
            drinkPrice = 0;
        }

        file << "Juice: " << js << endl;
    }

    else if (ch == 2)
    {
        cout << "SHAKES MENU" << endl;
        cout << "-----------" << endl;

        string shakeNames[] = {"Sweet vanilla", "Mexican chocolate", "Dulce de leche", "Wild strawberry"};
        int shakePrices[] = {149, 169, 199, 159};
        int shakeCount = 4;

        for (int i = 0; i < shakeCount; i++)
        {
            cout << (i + 1) << ". " << shakeNames[i];
            cout << ":" << shakePrices[i] << "/-" << endl;
        }

        cout << "which shake would you like to have?: ";
        cin >> ws;
        getline(cin, js);

        // Convert to lowercase for case-insensitive matching
        string jsLower = toLower(js);
        bool shakeFound = false;
        int choice = -1;

        // Try numeric match first
        try
        {
            choice = stoi(jsLower);
            if (choice >= 1 && choice <= shakeCount)
            {
                drinkPrice = shakePrices[choice - 1];
                shakeFound = true;
                js = shakeNames[choice - 1]; // Update js to actual name
            }
        }
        catch (...)
        {
            // Not a number, try name matching
        }

        // If not found, try name matching (case-insensitive)
        if (!shakeFound)
        {
            for (int i = 0; i < shakeCount; i++)
            {
                if (jsLower.find(toLower(shakeNames[i])) != string::npos)
                {
                    drinkPrice = shakePrices[i];
                    shakeFound = true;
                    js = shakeNames[i]; // Update js to actual name
                    break;
                }
            }
        }

        if (!shakeFound)
        {
            cout << "Invalid shake selection! Please enter a number (1-4) or shake name." << endl;
            drinkPrice = 0;
        }

        file << "Shake: " << js << endl;
    }
    else
    {
        cout << "Invalid selection for drinks." << endl;
    }

    cout << "would you like to continue your order with main course?\n";
    cout << "press 'y' for yes and 'n' for no: ";
    cin >> pm;
    file << "Main course (y/n): " << pm << endl;

    if (pm == 'y' || pm == 'Y')
    {
        cout << "please enter your choice <3 " << endl;
        cout << "Wrap or Taco (press 1 for wraps and 2 for taco): ";
        cin >> mc;

        if (mc == 1)
        {
            cout << "WRAP" << endl;
            cout << "-----" << endl;
            int wraps = 0;
            cout << "1. Spicy paneer";
            wraps = 199;
            cout << ":" << wraps << "/-" << endl;
            cout << "2. Crispy chicken";
            wraps = 249;
            cout << ":" << wraps << "/-" << endl;
            cout << "3. Crispy potato";
            wraps = 179;
            cout << ":" << wraps << "/-" << endl;
            cout << "4. Hot bean";
            wraps = 159;
            cout << ":" << wraps << "/-" << endl;
            cout << "which wrap would you like to have? ";
            cin >> ws;
            getline(cin, wr);
            file << "Wrap: " << wr << endl;
            mainCoursePrice = wraps;
        }

        else if (mc == 2)
        {
            cout << "TACO" << endl;
            cout << "-----" << endl;
            int tacos = 0;
            cout << "1. Soft shell taco";
            tacos = 129;
            cout << ":" << tacos << "/-" << endl;
            cout << "2. Crunchy taco";
            tacos = 149;
            cout << ":" << tacos << "/-" << endl;
            cout << "3. Naked taco";
            tacos = 159;
            cout << ":" << tacos << "/-" << endl;
            cout << "4. Cheesy lava taco";
            tacos = 179;
            cout << ":" << tacos << "/-" << endl;
            cout << "w hich taco would you like to have? ";
            cin >> ws;
            getline(cin, tc);
            file << "Taco: " << tc << endl;
            mainCoursePrice = tacos;
        }
        else
        {
            cout << "invalid input for main course selection" << endl;
        }
    }

    if (ch != 1 && ch != 2 && mc != 1 && mc != 2)
    {
        cout << "No items were selected. Exiting order process." << endl;
        file.close();
        return 0;
    }

    // Display billing gateway
    cout << "\n";
    cout << "\t\t\t BILLING GATEWAY" << endl;
    cout << "\t\t\t=================" << endl;

    // Add drink to bill
    if (ch == 1)
    {
        cout << js << " (Juice)" << "\t\t" << drinkPrice << "/-" << endl;
        file << "Juice Price: " << drinkPrice << endl;
        totalBill += drinkPrice;
    }
    else if (ch == 2)
    {
        cout << sh << " (Shake)" << "\t\t" << drinkPrice << "/-" << endl;
        file << "Shake Price: " << drinkPrice << endl;
        totalBill += drinkPrice;
    }

    else if (ch != 1 && ch != 2)
    {
        cout << "No drinks were selected." << endl;
    }

    // Add main course to bill
    if (mc == 1)
    {
        cout << wr << " (Wrap)" << "\t\t" << mainCoursePrice << "/-" << endl;
        file << "Wrap Price: " << mainCoursePrice << endl;
        totalBill += mainCoursePrice;
    }
    else if (mc == 2)
    {
        cout << tc << " (Taco)" << "\t\t" << mainCoursePrice << "/-" << endl;
        file << "Taco Price: " << mainCoursePrice << endl;
        totalBill += mainCoursePrice;
    }
    else if (mc != 1 && mc != 2)
    {
        cout << "No main course was selected." << endl;
    }

    cout << "-----------------------------" << endl;
    cout << "TOTAL BILL: " << totalBill << "/-" << endl;
    file << "Total Bill: " << totalBill << endl;
    cout << "-----------------------------" << endl;

    cout << "\n";
    cout << "\t\t\t PAYMENT GATEWAY" << endl;
    cout << "\t\t\t=================" << endl;
    cout << "please select the payment method" << endl;
    cout << "UPI/cash (press 1 for upi and 2 for cash): ";
    cin >> pm1;

    if (pm1 == 1)
    {
        cout << "\nOpening UPI QR Code..." << endl;
        
        // Create proper UPI link: upi://pay?pa=<UPI_ID>&pn=<NAME>&am=<AMOUNT>&cu=INR
        string upiLink = "upi://pay?pa=9625065557@upi&pn=TacoBell&am=" + 
                         to_string((int)totalBill) + "&cu=INR";

        // Create HTML file with QR code generator
        ofstream htmlFile("qr_payment.html");
        htmlFile << "<!DOCTYPE html>" << endl;
        htmlFile << "<html lang=\"en\">" << endl;
        htmlFile << "<head>" << endl;
        htmlFile << "    <meta charset=\"UTF-8\">" << endl;
        htmlFile << "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" << endl;
        htmlFile << "    <title>Taco Bell - UPI Payment QR Code</title>" << endl;
        htmlFile << "    <script src=\"https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js\"></script>" << endl;
        htmlFile << "    <style>" << endl;
        htmlFile << "        body {" << endl;
        htmlFile << "            font-family: Arial, sans-serif;" << endl;
        htmlFile << "            display: flex;" << endl;
        htmlFile << "            justify-content: center;" << endl;
        htmlFile << "            align-items: center;" << endl;
        htmlFile << "            min-height: 100vh;" << endl;
        htmlFile << "            margin: 0;" << endl;
        htmlFile << "            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);" << endl;
        htmlFile << "        }" << endl;
        htmlFile << "        .container {" << endl;
        htmlFile << "            background: white;" << endl;
        htmlFile << "            padding: 40px;" << endl;
        htmlFile << "            border-radius: 15px;" << endl;
        htmlFile << "            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);" << endl;
        htmlFile << "            text-align: center;" << endl;
        htmlFile << "            max-width: 500px;" << endl;
        htmlFile << "        }" << endl;
        htmlFile << "        h1 {" << endl;
        htmlFile << "            color: #333;" << endl;
        htmlFile << "            margin-bottom: 10px;" << endl;
        htmlFile << "        }" << endl;
        htmlFile << "        .subtitle {" << endl;
        htmlFile << "            color: #666;" << endl;
        htmlFile << "            margin-bottom: 30px;" << endl;
        htmlFile << "            font-size: 16px;" << endl;
        htmlFile << "        }" << endl;
        htmlFile << "        #qrcode {" << endl;
        htmlFile << "            display: inline-block;" << endl;
        htmlFile << "            margin: 20px 0;" << endl;
        htmlFile << "            padding: 20px;" << endl;
        htmlFile << "            background: #f5f5f5;" << endl;
        htmlFile << "            border-radius: 10px;" << endl;
        htmlFile << "        }" << endl;
        htmlFile << "        .amount {" << endl;
        htmlFile << "            font-size: 24px;" << endl;
        htmlFile << "            color: #667eea;" << endl;
        htmlFile << "            font-weight: bold;" << endl;
        htmlFile << "            margin: 20px 0;" << endl;
        htmlFile << "        }" << endl;
        htmlFile << "        .upi-id {" << endl;
        htmlFile << "            color: #666;" << endl;
        htmlFile << "            margin: 10px 0;" << endl;
        htmlFile << "            font-size: 14px;" << endl;
        htmlFile << "        }" << endl;
        htmlFile << "        .instructions {" << endl;
        htmlFile << "            color: #999;" << endl;
        htmlFile << "            margin-top: 20px;" << endl;
        htmlFile << "            font-size: 12px;" << endl;
        htmlFile << "        }" << endl;
        htmlFile << "    </style>" << endl;
        htmlFile << "</head>" << endl;
        htmlFile << "<body>" << endl;
        htmlFile << "    <div class=\"container\">" << endl;
        htmlFile << "        <h1>Taco Bell Payment</h1>" << endl;
        htmlFile << "        <p class=\"subtitle\">Scan the QR code to complete your payment</p>" << endl;
        htmlFile << "        <div id=\"qrcode\"></div>" << endl;
        htmlFile << "        <div class=\"amount\">₹" << (int)totalBill << "/-</div>" << endl;
        htmlFile << "        <div class=\"upi-id\">UPI ID: 9625065557@upi</div>" << endl;
        htmlFile << "        <p class=\"instructions\">Scan this QR code with any UPI app (Google Pay, PhonePe, Paytm, etc.)</p>" << endl;
        htmlFile << "    </div>" << endl;
        htmlFile << "    <script>" << endl;
        htmlFile << "        new QRCode(document.getElementById('qrcode'), {" << endl;
        htmlFile << "            text: \"" << upiLink << "\"," << endl;
        htmlFile << "            width: 256," << endl;
        htmlFile << "            height: 256," << endl;
        htmlFile << "            colorDark: '#000000'," << endl;
        htmlFile << "            colorLight: '#ffffff'," << endl;
        htmlFile << "            correctLevel: QRCode.CorrectLevel.H" << endl;
        htmlFile << "        });" << endl;
        htmlFile << "    </script>" << endl;
        htmlFile << "</body>" << endl;
        htmlFile << "</html>" << endl;
        htmlFile.close();
        
        // Open HTML file in browser
        system("start qr_payment.html");
        
        cout << "Please scan the QR code to complete payment." << endl;
        cout << "Amount to pay: " << totalBill << "/-" << endl;
        cout << "UPI ID: 9625065557@upi" << endl;
        cout << "QR Code page opened in your browser (qr_payment.html)" << endl;
        
        file << "Payment Method: UPI" << endl;
        file << "UPI ID: 9625065557@upi" << endl;
        file << "Amount Paid: " << totalBill << endl;
    }

    else if (pm1 == 2)
    {
        cout << "please pay on the counter." << endl;
        cout << "Amount to pay: " << totalBill << "/-" << endl;
        cout << "-----------------------------" << endl;
        file << "Payment Method: Cash" << endl;
        file << "Amount to Pay: " << totalBill << endl;
    }

    else
    {
        cout << "invalid input" << endl;
        file << "Payment: invalid" << endl;
    }

    cout << "thank you for choosing Taco Bell!" << endl;

    file.close();

    return 0;
}
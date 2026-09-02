#include <iostream>
#include <fstream>
#include <string>
#include <cctype>
#include <cstdlib>
#include <vector>
#include <ctime>
#include <sstream>
#include <iomanip>

using namespace std;

// Helper function to convert string to lowercase
string toLower(string str)
{
    for (auto &c : str)
        c = tolower(c);
    return str;
}


string escapeJsonString(const string &input)
{
    string output = "";
    for (char c : input)
    {
        if (c == '"') output += "\\\"";
        else if (c == '\\') output += "\\\\";
        else if (c == '\b') output += "\\b";
        else if (c == '\f') output += "\\f";
        else if (c == '\n') output += "\\n";
        else if (c == '\r') output += "\\r";
        else if (c == '\t') output += "\\t";
        else output += c;
    }
    return output;
}

// Helper function to get current formatted timestamp (Cross-platform safe)
string getCurrentTimestamp()
{
    time_t now = time(0);
    tm ltm;
#if defined(_MSC_VER)
    localtime_s(&ltm, &now);
#else
    tm *temp = localtime(&now);
    if (temp) ltm = *temp;
    else ltm = {};  
#endif
    stringstream ss;
    ss << setfill('0') 
       << (1900 + ltm.tm_year) << "-" 
       << setw(2) << (1 + ltm.tm_mon) << "-" 
       << setw(2) << ltm.tm_mday << " " 
       << setw(2) << ltm.tm_hour << ":" 
       << setw(2) << ltm.tm_min << ":" 
       << setw(2) << ltm.tm_sec;
    return ss.str();
}

// Helper function to append order to orders.json for real-time dashboard integration
void appendOrderToJson(const string &orderId, const string &customer, 
                       const string &drink, double drinkPrice, const string &drinkCategory,
                       const string &mainCourse, double mainCoursePrice, const string &mainCourseCategory,
                       double total, const string &paymentMethod, const string &timestamp)
{
    ifstream inFile("orders.json");
    string existingContent = "";
    if (inFile.is_open())
    {
        stringstream buffer;
        buffer << inFile.rdbuf();
        existingContent = buffer.str();
        inFile.close();
    }

    size_t first = existingContent.find_first_not_of(" \t\n\r");
    size_t last = existingContent.find_last_not_of(" \t\n\r");
    if (first == string::npos)
    {
        existingContent = "[]";
    }
    else
    {
        existingContent = existingContent.substr(first, (last - first + 1));
        if (existingContent.length() < 2 || existingContent.front() != '[' || existingContent.back() != ']')
        {
            existingContent = "[]";
        }
    }

    // Build JSON items array
    stringstream itemsStream;
    itemsStream << "[\n";
    bool hasPreviousItem = false;
    if (drinkPrice > 0)
    {
        itemsStream << "      { \"name\": \"" << escapeJsonString(drink) << "\", \"category\": \"" 
                    << escapeJsonString(drinkCategory) << "\", \"price\": " << drinkPrice << ", \"qty\": 1 }";
        hasPreviousItem = true;
    }
    if (mainCoursePrice > 0)
    {
        if (hasPreviousItem) itemsStream << ",\n";
        itemsStream << "      { \"name\": \"" << escapeJsonString(mainCourse) << "\", \"category\": \"" 
                    << escapeJsonString(mainCourseCategory) << "\", \"price\": " << mainCoursePrice << ", \"qty\": 1 }";
    }
    itemsStream << "\n    ]";

    stringstream ss;
    ss << "  {\n"
       << "    \"id\": \"" << escapeJsonString(orderId) << "\",\n"
       << "    \"customer\": \"" << escapeJsonString(customer) << "\",\n"
       << "    \"drink\": \"" << escapeJsonString(drink) << "\",\n"
       << "    \"drinkPrice\": " << drinkPrice << ",\n"
       << "    \"mainCourse\": \"" << escapeJsonString(mainCourse) << "\",\n"
       << "    \"mainCoursePrice\": " << mainCoursePrice << ",\n"
       << "    \"items\": " << itemsStream.str() << ",\n"
       << "    \"totalBill\": " << total << ",\n"
       << "    \"paymentMethod\": \"" << escapeJsonString(paymentMethod) << "\",\n"
       << "    \"status\": \"Pending\",\n"
       << "    \"source\": \"C++ Terminal\",\n"
       << "    \"timestamp\": \"" << timestamp << "\",\n"
       << "    \"tableNo\": \"Terminal-POS\"\n"
       << "  }";

    string newOrderJson = ss.str();
    string finalJson = "";

    if (existingContent == "[]")
    {
        finalJson = "[\n" + newOrderJson + "\n]";
    }
    else
    {
        size_t closeBracket = existingContent.find_last_of(']');
        if (closeBracket != string::npos)
        {
            finalJson = existingContent.substr(0, closeBracket);
            size_t lastComma = finalJson.find_last_not_of(" \t\n\r");
            if (lastComma != string::npos && finalJson[lastComma] != '[')
            {
                finalJson = finalJson.substr(0, lastComma + 1) + ",\n" + newOrderJson + "\n]";
            }
            else
            {
                finalJson = finalJson + "\n" + newOrderJson + "\n]";
            }
        }
        else
        {
            finalJson = "[\n" + newOrderJson + "\n]";
        }
    }

    ofstream outFile("orders.json");
    if (outFile.is_open())
    {
        outFile << finalJson;
        outFile.close();
    }
}

int main()
{
    cout << "========================================================" << endl;
    cout << "\t\t TACO BELL GOURMET MENU" << endl;
    cout << "========================================================" << endl;

    string user = "Guest Customer", js = "None", sh = "None", wr = "None", tc = "None";
    int mc = 0, ch = 0, pm1 = 0;
    char pm = 'n';
    double drinkPrice = 0, mainCoursePrice = 0, totalBill = 0;
    string selectedDrink = "None";
    string selectedMainCourse = "None";
    string drinkCategory = "None";
    string mainCourseCategory = "None";

    cout << "\nEnter your name (or press Enter for Guest): ";
    getline(cin, user);
    if (user.empty())
    {
        user = "Guest Customer";
    }

    cout << "\nWelcome to Taco Bell Gourmet, " << user << "!" << endl;
    cout << "--------------------------------------------------------" << endl;
    cout << "What beverage would you like?" << endl;
    cout << "Press 1 for Fresh Juices, 2 for Luxury Shakes, 0 to skip: ";
    
    if (!(cin >> ch))
    {
        ch = 0;
        cin.clear();
        string dummy;
        getline(cin, dummy);
    }

    if (ch == 1)
    {
        cout << "\n------------------ FRESH JUICES MENU ------------------" << endl;
        string juiceNames[] = {"Pineapple lime", "Cranberry crush", "Mango peach", "Dragonfruit berry"};
        int juicePrices[] = {159, 189, 179, 199};
        int juiceCount = 4;

        for (int i = 0; i < juiceCount; i++)
        {
            cout << "  " << (i + 1) << ". " << juiceNames[i] << " \t- Rs." << juicePrices[i] << "/-" << endl;
        }

        cout << "Which juice would you like? (Enter 1-4 or name): ";
        cin >> ws;
        getline(cin, js);

        string jsLower = toLower(js);
        bool juiceFound = false;
        int choice = -1;

        try
        {
            choice = stoi(jsLower);
            if (choice >= 1 && choice <= juiceCount)
            {
                drinkPrice = juicePrices[choice - 1];
                juiceFound = true;
                js = juiceNames[choice - 1];
            }
        }
        catch (...)
        {
        }

        if (!juiceFound)
        {
            for (int i = 0; i < juiceCount; i++)
            {
                if (jsLower.find(toLower(juiceNames[i])) != string::npos || 
                    toLower(juiceNames[i]).find(jsLower) != string::npos)
                {
                    drinkPrice = juicePrices[i];
                    juiceFound = true;
                    js = juiceNames[i];
                    break;
                }
            }
        }

        if (!juiceFound)
        {
            cout << ">> Invalid juice choice! Defaulting to no juice." << endl;
            drinkPrice = 0;
            js = "None";
        }
        else
        {
            selectedDrink = js;
            drinkCategory = "Juice";
            cout << ">> Added: " << js << " (Rs." << drinkPrice << "/-)" << endl;
        }
    }
    else if (ch == 2)
    {
        cout << "\n------------------ LUXURY SHAKES MENU -----------------" << endl;
        string shakeNames[] = {"Sweet vanilla", "Mexican chocolate", "Dulce de leche", "Wild strawberry"};
        int shakePrices[] = {149, 169, 199, 159};
        int shakeCount = 4;

        for (int i = 0; i < shakeCount; i++)
        {
            cout << "  " << (i + 1) << ". " << shakeNames[i] << " \t- Rs." << shakePrices[i] << "/-" << endl;
        }

        cout << "Which shake would you like? (Enter 1-4 or name): ";
        cin >> ws;
        getline(cin, sh);

        string shLower = toLower(sh);
        bool shakeFound = false;
        int choice = -1;

        try
        {
            choice = stoi(shLower);
            if (choice >= 1 && choice <= shakeCount)
            {
                drinkPrice = shakePrices[choice - 1];
                shakeFound = true;
                sh = shakeNames[choice - 1];
            }
        }
        catch (...)
        {
        }

        if (!shakeFound)
        {
            for (int i = 0; i < shakeCount; i++)
            {
                if (shLower.find(toLower(shakeNames[i])) != string::npos ||
                    toLower(shakeNames[i]).find(shLower) != string::npos)
                {
                    drinkPrice = shakePrices[i];
                    shakeFound = true;
                    sh = shakeNames[i];
                    break;
                }
            }
        }

        if (!shakeFound)
        {
            cout << ">> Invalid shake choice! Defaulting to no shake." << endl;
            drinkPrice = 0;
            sh = "None";
        }
        else
        {
            selectedDrink = sh;
            drinkCategory = "Shake";
            cout << ">> Added: " << sh << " (Rs." << drinkPrice << "/-)" << endl;
        }
    }
    else
    {
        cout << ">> No beverage selected." << endl;
    }

    cout << "\nWould you like to add a Main Course item? (y/n): ";
    cin >> pm;

    if (pm == 'y' || pm == 'Y')
    {
        cout << "Select Main Course (Press 1 for Wraps, 2 for Tacos): ";
        if (!(cin >> mc))
        {
            mc = 0;
            cin.clear();
            string dummy;
            getline(cin, dummy);
        }

        if (mc == 1)
        {
            cout << "\n------------------ ARTISANAL WRAPS MENU ----------------" << endl;
            string wrapNames[] = {"Spicy paneer", "Crispy chicken", "Crispy potato", "Hot bean"};
            int wrapPrices[] = {199, 249, 179, 159};
            int wrapCount = 4;

            for (int i = 0; i < wrapCount; i++)
            {
                cout << "  " << (i + 1) << ". " << wrapNames[i] << " \t- Rs." << wrapPrices[i] << "/-" << endl;
            }

            cout << "Which wrap would you like? (Enter 1-4 or name): ";
            cin >> ws;
            getline(cin, wr);

            string wrLower = toLower(wr);
            bool wrapFound = false;
            int choice = -1;

            try
            {
                choice = stoi(wrLower);
                if (choice >= 1 && choice <= wrapCount)
                {
                    mainCoursePrice = wrapPrices[choice - 1];
                    wrapFound = true;
                    wr = wrapNames[choice - 1];
                }
            }
            catch (...)
            {
            }

            if (!wrapFound)
            {
                for (int i = 0; i < wrapCount; i++)
                {
                    if (wrLower.find(toLower(wrapNames[i])) != string::npos ||
                        toLower(wrapNames[i]).find(wrLower) != string::npos)
                    {
                        mainCoursePrice = wrapPrices[i];
                        wrapFound = true;
                        wr = wrapNames[i];
                        break;
                    }
                }
            }

            if (wrapFound)
            {
                selectedMainCourse = wr;
                mainCourseCategory = "Wrap";
                cout << ">> Added: " << wr << " (Rs." << mainCoursePrice << "/-)" << endl;
            }
            else
            {
                cout << ">> Invalid wrap choice." << endl;
                mainCoursePrice = 0;
            }
        }
        else if (mc == 2)
        {
            cout << "\n------------------ SIGNATURE TACOS MENU ----------------" << endl;
            string tacoNames[] = {"Soft shell taco", "Crunchy taco", "Naked taco", "Cheesy lava taco"};
            int tacoPrices[] = {129, 149, 159, 179};
            int tacoCount = 4;

            for (int i = 0; i < tacoCount; i++)
            {
                cout << "  " << (i + 1) << ". " << tacoNames[i] << " \t- Rs." << tacoPrices[i] << "/-" << endl;
            }

            cout << "Which taco would you like? (Enter 1-4 or name): ";
            cin >> ws;
            getline(cin, tc);

            string tcLower = toLower(tc);
            bool tacoFound = false;
            int choice = -1;

            try
            {
                choice = stoi(tcLower);
                if (choice >= 1 && choice <= tacoCount)
                {
                    mainCoursePrice = tacoPrices[choice - 1];
                    tacoFound = true;
                    tc = tacoNames[choice - 1];
                }
            }
            catch (...)
            {
            }

            if (!tacoFound)
            {
                for (int i = 0; i < tacoCount; i++)
                {
                    if (tcLower.find(toLower(tacoNames[i])) != string::npos ||
                        toLower(tacoNames[i]).find(tcLower) != string::npos)
                    {
                        mainCoursePrice = tacoPrices[i];
                        tacoFound = true;
                        tc = tacoNames[i];
                        break;
                    }
                }
            }

            if (tacoFound)
            {
                selectedMainCourse = tc;
                mainCourseCategory = "Taco";
                cout << ">> Added: " << tc << " (Rs." << mainCoursePrice << "/-)" << endl;
            }
            else
            {
                cout << ">> Invalid taco choice." << endl;
                mainCoursePrice = 0;
            }
        }
        else
        {
            cout << ">> Invalid main course option." << endl;
        }
    }

    if (drinkPrice == 0 && mainCoursePrice == 0)
    {
        cout << "\n[!] No items were selected. Exiting order process." << endl;
        return 0;
    }

    totalBill = drinkPrice + mainCoursePrice;

    // Display billing gateway
    cout << "\n========================================================" << endl;
    cout << "\t\t     ORDER SUMMARY" << endl;
    cout << "========================================================" << endl;
    cout << "Customer: " << user << endl;

    if (drinkPrice > 0)
    {
        cout << "  * " << selectedDrink << " (" << drinkCategory << ")" << " \t Rs." << drinkPrice << "/-" << endl;
    }
    if (mainCoursePrice > 0)
    {
        cout << "  * " << selectedMainCourse << " (" << mainCourseCategory << ")" << " \t Rs." << mainCoursePrice << "/-" << endl;
    }

    cout << "--------------------------------------------------------" << endl;
    cout << "  TOTAL BILL: Rs." << totalBill << "/-" << endl;
    cout << "========================================================" << endl;

    cout << "\nSelect Payment Method:" << endl;
    cout << "1. Instant UPI QR Code" << endl;
    cout << "2. Cash at Counter" << endl;
    cout << "Enter choice (1 or 2): ";
    if (!(cin >> pm1))
    {
        pm1 = 2;
    }

    string paymentMethod = "Cash";
    string timestamp = getCurrentTimestamp();
    string orderId = "TB-" + to_string(time(0) % 100000);

    if (pm1 == 1)
    {
        paymentMethod = "UPI";
        cout << "\nGenerating UPI Payment QR Code..." << endl;
        
        string upiLink = "upi://pay?pa=9311515712@waaxis&pn=TacoBell&am=" + 
                         to_string((int)totalBill) + "&cu=INR";

        ofstream htmlFile("qr_payment.html");
        if (htmlFile.is_open())
        {
            htmlFile << "<!DOCTYPE html>\n"
                     << "<html lang=\"en\">\n"
                     << "<head>\n"
                     << "    <meta charset=\"UTF-8\">\n"
                     << "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n"
                     << "    <title>Taco Bell - UPI Payment QR Code</title>\n"
                     << "    <script src=\"https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js\"></script>\n"
                     << "    <link href=\"https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap\" rel=\"stylesheet\">\n"
                     << "    <style>\n"
                     << "        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }\n"
                     << "        body { min-height: 100vh; display: flex; justify-content: center; align-items: center; background: radial-gradient(circle at top, #1e1b4b, #0f172a, #030712); color: #f8fafc; padding: 20px; }\n"
                     << "        .card { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); padding: 36px; border-radius: 24px; box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5); text-align: center; max-width: 440px; width: 100%; animation: popIn 0.5s ease-out; }\n"
                     << "        @keyframes popIn { from { opacity: 0; transform: scale(0.9) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }\n"
                     << "        .badge { display: inline-block; padding: 6px 14px; background: rgba(99, 102, 241, 0.2); border: 1px solid rgba(99, 102, 241, 0.4); border-radius: 9999px; color: #818cf8; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; }\n"
                     << "        h1 { font-size: 26px; font-weight: 800; margin-bottom: 8px; background: linear-gradient(135deg, #a855f7, #6366f1, #38bdf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }\n"
                     << "        p.sub { color: #94a3b8; font-size: 14px; margin-bottom: 24px; }\n"
                     << "        .qr-wrap { background: #ffffff; padding: 20px; border-radius: 18px; display: inline-flex; justify-content: center; align-items: center; box-shadow: 0 10px 30px rgba(99, 102, 241, 0.25); margin-bottom: 20px; }\n"
                     << "        .amount { font-size: 32px; font-weight: 800; color: #38bdf8; margin-bottom: 8px; }\n"
                     << "        .upi-box { background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255, 255, 255, 0.08); padding: 12px; border-radius: 12px; font-size: 14px; color: #cbd5e1; font-family: monospace; letter-spacing: 0.5px; margin-bottom: 20px; }\n"
                     << "        .timer { font-size: 13px; color: #f59e0b; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 6px; }\n"
                     << "        .timer-dot { width: 8px; height: 8px; border-radius: 50%; background: #f59e0b; animation: blink 1s infinite; }\n"
                     << "        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }\n"
                     << "    </style>\n"
                     << "</head>\n"
                     << "<body>\n"
                     << "    <div class=\"card\">\n"
                     << "        <div class=\"badge\">Order #" << orderId << "</div>\n"
                     << "        <h1>Taco Bell Payment</h1>\n"
                     << "        <p class=\"sub\">Scan QR code with GPay, PhonePe, or Paytm</p>\n"
                     << "        <div class=\"qr-wrap\"><div id=\"qrcode\"></div></div>\n"
                     << "        <div class=\"amount\">Rs." << (int)totalBill << "/-</div>\n"
                     << "        <div class=\"upi-box\">UPI ID: 9311515712@upi</div>\n"
                     << "        <div class=\"timer\"><span class=\"timer-dot\"></span> Awaiting Live Confirmation</div>\n"
                     << "    </div>\n"
                     << "    <script>\n"
                     << "        new QRCode(document.getElementById('qrcode'), {\n"
                     << "            text: \"" << upiLink << "\",\n"
                     << "            width: 220,\n"
                     << "            height: 220,\n"
                     << "            colorDark: '#0f172a',\n"
                     << "            colorLight: '#ffffff',\n"
                     << "            correctLevel: QRCode.CorrectLevel.H\n"
                     << "        });\n"
                     << "    </script>\n"
                     << "</body>\n"
                     << "</html>\n";
            htmlFile.close();
            system("start \"\" \"qr_payment.html\"");
        }

        cout << ">> Payment QR Code created (qr_payment.html)" << endl;
        cout << ">> Amount: Rs." << totalBill << "/- | UPI ID: 9311515712@upi" << endl;
    }
    else
    {
        paymentMethod = "Cash";
        cout << "\n>> Payment method set to CASH. Please settle at the counter." << endl;
    }

    // Append to food_order.txt
    ofstream file("food_order.txt", ios::app);
    if (file.is_open())
    {
        file << "===========================================" << endl;
        file << "Order ID: " << orderId << endl;
        file << "Timestamp: " << timestamp << endl;
        file << "Customer Name: " << user << endl;
        if (drinkPrice > 0)
        {
            file << "Drink: " << selectedDrink << " (" << drinkCategory << ")" << endl;
            file << "Drink Price: " << drinkPrice << endl;
        }
        if (mainCoursePrice > 0)
        {
            file << "Main Course: " << selectedMainCourse << " (" << mainCourseCategory << ")" << endl;
            file << "Main Course Price: " << mainCoursePrice << endl;
        }
        file << "Total Bill: " << totalBill << endl;
        file << "Payment Method: " << paymentMethod << endl;
        if (paymentMethod == "UPI")
        {
            file << "UPI ID: 9311515712@upi" << endl;
            file << "Amount Paid: " << totalBill << endl;
        }
        else
        {
            file << "Amount to Pay: " << totalBill << endl;
        }
        file << "Status: Pending" << endl;
        file << "===========================================" << endl << endl;
        file.close();
    }

    // Append to orders.json for real-time dashboard sync
    appendOrderToJson(orderId, user, selectedDrink, drinkPrice, drinkCategory,
                      selectedMainCourse, mainCoursePrice, mainCourseCategory,
                      totalBill, paymentMethod, timestamp);

    cout << "\nSUCCESS: Order #" << orderId << " has been logged and synced to Real-Time Dashboard!" << endl;
    cout << "Thank you for dining with Taco Bell Gourmet." << endl;
    cout << "========================================================" << endl;

    return 0;
}
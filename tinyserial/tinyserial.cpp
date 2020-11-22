
#include <iostream>
#include<windows.h>
#include <string>
#include <thread>
#include <Synchapi.h>

class TinySerial {
public:
    TinySerial() {}
    ~TinySerial() {};

    /**
     * Opens a serial port
     * @param portName name of the port to open, the portnames are OS specific - for example "COM1" for Windows
     */
    bool open(const std::string portName) {
        if (isOpen) return false;
        const DWORD COM_PORT_CANNOT_BE_SHARED = 0;
        const LPSECURITY_ATTRIBUTES DEFAULT_SECURITY_DESCRIPTOR = NULL;
        const DWORD NO_FILE_ATTRIBUTES = 0;
        const HANDLE NO_TEMPLATE_FILE = NULL;

        handleToComPort = CreateFileA(portName.c_str(),
            GENERIC_READ | GENERIC_WRITE,
            COM_PORT_CANNOT_BE_SHARED,
            DEFAULT_SECURITY_DESCRIPTOR,
            OPEN_EXISTING,
            NO_FILE_ATTRIBUTES,
            NO_TEMPLATE_FILE
        );
        lastError = GetLastError();
        isOpen = (handleToComPort != INVALID_HANDLE_VALUE);
        if (!isOpen) {
            lastError = GetLastError();
        }
        else {
            setTimeouts();
            setStandardComState();
            setReadEvent();
        }
        return isOpen;
    }

    /*
    * Prints the state settings of the currently open com port
    */
    void printComState() {
        if (!isOpen) return;
        DCB dcbSerialParams = { 0 };
        auto status = GetCommState(handleToComPort, &dcbSerialParams);
        std::cout << "BaudRate: " << dcbSerialParams.BaudRate <<
            " ByteSize: " << (int) dcbSerialParams.ByteSize <<
            " Stop bits: " << (int) dcbSerialParams.StopBits <<
            " Parity: " << (int) dcbSerialParams.Parity << std::endl;
    }

    /*
    * Sets the baud rate of the com port
    * @param baudRate baudRate to set
    */
    void setBaudRate(DWORD baudRate) {
        if (!isOpen) return;
        DCB dcbSerialParams = { 0 };
        auto Status = GetCommState(handleToComPort, &dcbSerialParams);
        dcbSerialParams.BaudRate = baudRate;
        SetCommState(handleToComPort, &dcbSerialParams);
    }

    /*
    * Writes data to the serial port
    * @param dataToWriteToPort a pointer to a data buffer
    * @param amountOfBytesToWrite amount of bytes to write from the buffer to the serial port
    * @returns amount of bytes written
    */
    DWORD write(const char* dataToWriteToPort, DWORD amountOfBytesToWrite) {
        if (!isOpen) return 0;
        const LPOVERLAPPED NO_OVERLAP_STRUCTURE = NULL;
        DWORD amountOfBytesWritten = 0;     // No of bytes written to the port

        auto status = WriteFile(handleToComPort,
            dataToWriteToPort,
            amountOfBytesToWrite,
            &amountOfBytesWritten,
            NO_OVERLAP_STRUCTURE);
        return amountOfBytesWritten;
    }

    /*
    * Writes data to the serial port
    * @param dataToWriteToPort a string to write to the port
    * @returns amount of bytes written
    */
    DWORD write(const std::string dataToWriteToPort) {
        return write(dataToWriteToPort.c_str(), (DWORD) dataToWriteToPort.length() + 1);
    }

    /*
    * Reads data from the serial port
    */
    DWORD read(char* buffer, size_t bufferSize) {
        if (!isOpen) return 0;
        const LPOVERLAPPED NO_OVERLAP_STRUCTURE = NULL;
        DWORD amountOfBytesRead;

        ReadFile(handleToComPort,    
            buffer,       
            bufferSize,
            &amountOfBytesRead,    
            NO_OVERLAP_STRUCTURE);

        return amountOfBytesRead;
    }

    /*
    * Blocks execution, until the serial port sends data
    */
    auto waitUntilDataReceived() {
        const LPOVERLAPPED NO_OVERLAP_STRUCTURE = NULL;
        DWORD dwEventMask;
        auto status = WaitCommEvent(handleToComPort, &dwEventMask, NO_OVERLAP_STRUCTURE);
    }

    /*
    * Closes the serial port
    */
    void close() {
        if (!isOpen) return;
        CloseHandle(handleToComPort);
        isOpen = false;
    }

    /*
    * Gets a string describing the error
    */
    std::string getError() {
        return std::to_string(lastError);
    }

private:
    /*
     * Sets the timeout parameters to prevent blocking calls
     */
    void setTimeouts() {
        COMMTIMEOUTS timeouts = { 0 };
        timeouts.ReadIntervalTimeout = 50;
        timeouts.ReadTotalTimeoutConstant = 50;
        timeouts.ReadTotalTimeoutMultiplier = 10;
        timeouts.WriteTotalTimeoutConstant = 50;
        timeouts.WriteTotalTimeoutMultiplier = 10;
        SetCommTimeouts(handleToComPort, &timeouts);
    }

    /*
    * Sets standard com state
    */
    void setStandardComState() {
        if (!isOpen) return;
        DCB dcbSerialParams = { 0 };
        auto Status = GetCommState(handleToComPort, &dcbSerialParams);
        dcbSerialParams.BaudRate = CBR_9600;  
        dcbSerialParams.ByteSize = 8;         
        dcbSerialParams.StopBits = ONESTOPBIT;
        dcbSerialParams.Parity = NOPARITY;  
        SetCommState(handleToComPort, &dcbSerialParams);
    }

    /*
    * Sets a read event - to trigger a read function once data is received
    */
    void setReadEvent() {
        auto status = SetCommMask(handleToComPort, EV_RXCHAR);
    }

    TinySerial(const TinySerial&) {};
    DWORD lastError;
    HANDLE handleToComPort;
    bool isOpen;
};

TinySerial serial;

int main()
{
    if (!serial.open("COM5")) {
        std::cout << serial.getError() << std::endl;
    }
    serial.setBaudRate(1000000);
    serial.printComState();
    Sleep(1500);
    std::thread readThread([]() {
            char buffer[256];
            buffer[0] = 0;
            while (true) {
                auto bytesRead = serial.read(buffer, sizeof(buffer));
                std::cout << "Bytes read: " << bytesRead << " " << buffer << std::endl;
                Sleep(1);
            }
        });
    
    for (int i = 0; i < 10000000; i++) {
        serial.write("Hello World " + std::to_string(i));
        Sleep(1);
    }
    
    Sleep(1000);
    readThread.join();
    serial.close();
}

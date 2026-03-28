# HotelIQ - C# (.NET) Backend Documentation

This directory contains the **C# (.NET)** implementation of the core backend logic for the HotelIQ project. You can include these files in your .NET project folder to show your guide.

### 📁 File Structure

1.  **`Models.cs`**: Contains the core data structures (`Room`, `Booking`, `Customer`, `User`) and Enums. These are equivalent to the TypeScript interfaces used in the React app.
2.  **`HotelController.cs`**: An ASP.NET Core Web API Controller. It handles the API endpoints for rooms, bookings, and status updates.
3.  **`server.cs`**: A C# service that integrates with the **Google Gemini AI API**. It uses `HttpClient` to send prompts and receive room recommendations.

### 🚀 How to use these in a .NET Project

1.  **Create a new ASP.NET Core Web API project** in Visual Studio or via CLI:
    ```bash
    dotnet new webapi -n HotelIQ
    ```
2.  **Add the Models**: Copy the contents of `Models.cs` into a `Models/` folder in your project.
3.  **Add the Controller**: Copy `HotelController.cs` into the `Controllers/` folder.
4.  **Add the Service**: Copy `server.cs` into a `Services/` folder.
5.  **Configure API Key**: Add your Gemini API key to `appsettings.json`:
    ```json
    {
      "GEMINI_API_KEY": "your_actual_api_key_here"
    }
    ```
6.  **Register Services**: In `Program.cs`, register the `Server` service:
    ```csharp
    builder.Services.AddHttpClient<Server>();
    ```

### 💡 Note for your Guide
You can explain that the **Frontend** is built with **React (TypeScript)** for a modern user experience, and the **Backend** logic is designed to be compatible with **ASP.NET Core (C#)** for enterprise-grade scalability and type safety.

using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace HotelIQ.Services
{
    public class Server
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly string _modelUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

        public Server(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiKey = configuration["GEMINI_API_KEY"] ?? throw new ArgumentNullException("GEMINI_API_KEY is missing");
        }

        public async Task<string> GetRoomRecommendationAsync(string budget, string preferences)
        {
            var prompt = $@"
                You are a professional hotel concierge. Based on the following information, recommend the best room type (Single, Double, Suite, Deluxe):
                - Budget: {budget}
                - Preferences: {preferences}
                
                Provide a helpful and friendly response explaining why you chose that room type.
            ";

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = prompt }
                        }
                    }
                }
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync($"{_modelUrl}?key={_apiKey}", content);
            
            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                throw new Exception($"Gemini API error: {error}");
            }

            var responseJson = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseJson);
            
            // Extract the text from the response structure
            var text = doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            return text ?? "I'm sorry, I couldn't generate a recommendation at this time.";
        }
    }
}

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace HotelIQ.Models
{
    public enum RoomType
    {
        Single,
        Double,
        Suite,
        Deluxe
    }

    public enum RoomStatus
    {
        Available,
        Occupied,
        Maintenance
    }

    public enum BookingStatus
    {
        Confirmed,
        CheckedIn,
        CheckedOut,
        Cancelled
    }

    public enum UserRole
    {
        Admin,
        Staff,
        Guest
    }

    public class Room
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        [Required]
        public string RoomNumber { get; set; } = string.Empty;
        
        [Required]
        public RoomType Type { get; set; }
        
        [Required]
        [Range(0, double.MaxValue)]
        public decimal Price { get; set; }
        
        [Required]
        [Range(1, 10)]
        public int Capacity { get; set; }
        
        public RoomStatus Status { get; set; } = RoomStatus.Available;
        
        public string Description { get; set; } = string.Empty;
    }

    public class Customer
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        [Required]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string Phone { get; set; } = string.Empty;
        
        public string IdProof { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class Booking
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        [Required]
        public string RoomId { get; set; } = string.Empty;
        
        [Required]
        public string CustomerId { get; set; } = string.Empty;
        
        [Required]
        public DateTime CheckIn { get; set; }
        
        [Required]
        public DateTime CheckOut { get; set; }
        
        public decimal TotalAmount { get; set; }
        
        public BookingStatus Status { get; set; } = BookingStatus.Confirmed;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class User
    {
        public string Uid { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        public string DisplayName { get; set; } = string.Empty;
        
        public UserRole Role { get; set; } = UserRole.Guest;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

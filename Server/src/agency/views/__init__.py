from .auth import login, register, me, activate, request_password_reset, confirm_password_reset
from .user import users, user_detail
from .admin import admin_booking_detail, admin_bookings, admin_bookings_list, admin_dashboard
from .country import countries, country_detail
from .destination import destinations, destination_detail, top_destinations
from .arrangement import arrangements, arrangement_detail, top_arrangements, arrangements_filter
from .booking import bookings, booking_detail
from .agent import agent_bookings, agent_booking_detail
from .hotel import hotels, hotel_detail
from .transport import transports, transport_detail
from .analytics import admin_analytics, agent_analytics

__all__ = [
    'login',
    'register',
    'me',
    'activate',
    'request_password_reset',
    'confirm_password_reset',
    'users',
    'user_detail',
    'admin_dashboard',
    'admin_bookings_list',
    'admin_booking_detail',
    'countries',
    'country_detail',
    'destinations',
    'destination_detail',
    'top_destinations',
    'arrangements',
    'arrangement_detail',
    'top_arrangements',
    'arrangements_filter',
    'bookings',
    'booking_detail',
    'agent_bookings',
    'agent_booking_detail',
    'hotels',
    'hotel_detail',
    'transports',
    'transport_detail',
    'admin_analytics',
    'agent_analytics',
]

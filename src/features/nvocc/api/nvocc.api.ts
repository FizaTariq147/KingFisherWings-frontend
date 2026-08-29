export const NVOCC_API = {
  tariffs: {
    list: '/nvocc/tariffs',
    lookup: '/nvocc/tariffs/lookup',
    create: '/nvocc/tariffs',
    byId: (id: string) => `/nvocc/tariffs/${id}`,
  },
  voyages: {
    list: '/nvocc/voyages',
    create: '/nvocc/voyages',
    byId: (id: string) => `/nvocc/voyages/${id}`,
    publish: (id: string) => `/nvocc/voyages/${id}/publish`,
    close: (id: string) => `/nvocc/voyages/${id}/close`,
    markSailed: (id: string) => `/nvocc/voyages/${id}/mark-sailed`,
    copy: (id: string) => `/nvocc/voyages/${id}/copy`,
    loadList: (id: string) => `/nvocc/voyages/${id}/load-list`,
    loadListWeightCheck: (id: string) => `/nvocc/voyages/${id}/load-list/weight-check`,
    loadListPdf: (id: string) => `/nvocc/voyages/${id}/load-list/pdf`,
    loadListItem: (voyageId: string, itemId: string) =>
      `/nvocc/voyages/${voyageId}/load-list/${itemId}`,
    assignContainer: (voyageId: string, itemId: string) =>
      `/nvocc/voyages/${voyageId}/load-list/${itemId}/assign-container`,
  },
  enquiries: {
    list: '/nvocc/enquiries',
    analytics: '/nvocc/enquiries/analytics',
    create: '/nvocc/enquiries',
    byId: (id: string) => `/nvocc/enquiries/${id}`,
    sendRate: (id: string) => `/nvocc/enquiries/${id}/send-rate`,
    markLost: (id: string) => `/nvocc/enquiries/${id}/mark-lost`,
    convertToBooking: (id: string) => `/nvocc/enquiries/${id}/convert-to-booking`,
  },
  bookings: {
    list: '/nvocc/bookings',
    create: '/nvocc/bookings',
    byId: (id: string) => `/nvocc/bookings/${id}`,
    confirm: (id: string) => `/nvocc/bookings/${id}/confirm`,
    cancel: (id: string) => `/nvocc/bookings/${id}/cancel`,
    convertToJob: (id: string) => `/nvocc/bookings/${id}/convert-to-job`,
    sendCutoffReminder: (id: string) => `/nvocc/bookings/${id}/send-cutoff-reminder`,
    bookingConfirmation: (id: string) => `/nvocc/bookings/${id}/documents/booking-confirmation`,
  },
} as const;

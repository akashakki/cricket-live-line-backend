const express = require('express');
const userRoute = require('./user.routes');
const MediaRoute = require('./media.route');

const DisposableEmailRoute = require('./disposableEmailDomains.route');
const AdminAuthRoute = require('./admin/auth.route');
const AdminRoleRoute = require('./admin/role.route');
const AdminDashboardRoute = require('./admin/dashboard.route');
const userTicketRoute = require('./ticket.route');

// const TransactionRoute = require('./transaction.route');

const ContactUsRoute = require('./contactUs.route');
const FAQRoute = require('./faq.route');

const OddSeriesRoute = require('./oodSeries.route');

const HomePageRoute = require('./homePage.route');
const SeriesRoute = require('./series.route');
const NewsRoute = require('./news.route');
const PlayerRoute = require('./player.route');
const TeamRoute = require('./team.route');
const VenuesRoute = require('./venue.route');
const MatchesRoute = require('./matches.route');

const docsRoute = require('./docs.route');
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  { path: '/disposable-email-domains', route: DisposableEmailRoute },
  { path: '/media', route: MediaRoute },
  { path: '/user', route: userRoute },

  { path: '/admin', route: AdminAuthRoute },
  { path: '/admin/dashboard', route: AdminDashboardRoute },
  { path: '/admin/roles', route: AdminRoleRoute },
  { path: '/userTickets', route: userTicketRoute },
  { path: '/contact-us', route: ContactUsRoute },
  { path: '/faq', route: FAQRoute },
  
  { path: '/odds-series', route: OddSeriesRoute },


  { path: '/', route: HomePageRoute },
  { path: '/series', route: SeriesRoute },
  { path: '/admin-news', route: NewsRoute },
  { path: '/player', route: PlayerRoute },
  { path: '/team', route: TeamRoute },
  { path: '/venue', route: VenuesRoute },
  { path: '/matche', route: MatchesRoute },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;

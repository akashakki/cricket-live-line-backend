const cron = require('node-cron');
const { UserModel, UserSubscriptionModel } = require("../models");
const mailFunctions = require("../helpers/mailFunctions");

const createSubscription = async (userId, subscriptionData) => {
  try {
    const subscription = new Subscription({ userId, ...subscriptionData });
    await subscription.save();
    return subscription;
  } catch (error) {
    console.error('Error creating subscription:', error);
  }
};

// Handling Payments
const updatePaymentStatus = async (subscriptionId, paymentAmount) => {
    try {
      const subscription = await UserSubscriptionModel.findById(subscriptionId);
      if (!subscription) {
        throw new Error('Subscription not found');
      }
  
      subscription.paymentStatus = 'paid';
      subscription.paymentAmount = paymentAmount;
      subscription.paymentDate = new Date();
  
      // Calculate the next renewal date based on the subscription plan
      const renewalDate = new Date(subscription.apiRenewalDate);
      renewalDate.setMonth(renewalDate.getMonth() + 1); // Adjust based on plan
  
      subscription.apiRenewalDate = renewalDate;
      await subscription.save();
  
      console.log('Payment status updated successfully');
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  
//   Handle Pending Payments:
const checkPendingPayments = async () => {
    try {
      const now = new Date();
      const subscriptions = await UserSubscriptionModel.find({
        apiRenewalDate: { $lt: now },
        paymentStatus: 'pending'
      }).populate('userId');
  
      subscriptions.forEach(subscription => {
        // Implement logic to notify users about pending payments
        console.log(`Pending payment for subscription ${subscription._id}`);
        // e.g., send reminder email
      });
    } catch (error) {
      console.error('Error checking pending payments:', error);
    }
  };

//   Reminder Emails for Upcoming Payments
const sendRenewalReminders = async () => {
    try {
      const now = new Date();
      const twoDaysBefore = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
      const oneDayBefore = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
  
      const subscriptions = await UserSubscriptionModel.find({
        apiRenewalDate: { $in: [twoDaysBefore, oneDayBefore] },
        paymentStatus: 'pending'
      }).populate('userId');
  
      subscriptions.forEach(subscription => {
        const renewalDate = subscription.apiRenewalDate;
        let subject, text;
        if (renewalDate.toDateString() === twoDaysBefore.toDateString()) {
          subject = 'Subscription Renewal Reminder - 2 Days Left';
          text = `Dear ${subscription.userId.name},\n\nYour subscription will expire in 2 days on ${renewalDate.toDateString()}. Please make sure to renew your subscription to avoid any service interruptions.\n\nBest Regards,\nYour Company`;
        } else if (renewalDate.toDateString() === oneDayBefore.toDateString()) {
          subject = 'Subscription Renewal Reminder - 1 Day Left';
          text = `Dear ${subscription.userId.name},\n\nYour subscription will expire tomorrow on ${renewalDate.toDateString()}. Please make sure to renew your subscription immediately to avoid any service interruptions.\n\nBest Regards,\nYour Company`;
        }
  
        mailFunctions.sendEmail(subscription.userId.email, subject, text)
        // transporter.sendMail({
        //   from: 'your-email@gmail.com',
        //   to: subscription.userId.email,
        //   subject: subject,
        //   text: text
        // }, (error, info) => {
        //   if (error) {
        //     console.error('Error sending email:', error);
        //   } else {
        //     console.log('Email sent:', info.response);
        //   }
        // });
      });
    } catch (error) {
      console.error('Error sending reminder emails:', error);
    }
  };
  
  // Schedule the cron job to run daily
  cron.schedule('0 0 * * *', sendRenewalReminders); // Runs every day at midnight

// Background Service for Notifications

// Schedule a task to check pending payments and send reminders
cron.schedule('0 0 * * *', async () => {
    await checkPendingPayments();
    await sendRenewalReminders();
  });
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Role = require("../models/role");
const Event = require("../models/event");
const Booking = require("../models/booking");
const JWT_SECRET =
  "94a9c4a265b316e0a76a9f52573a79ff6787b47b64064b7493485a878e2bea381795c2639026ed6ab057ac62fd877ff0d383e88b038314a4326868afb041b49d";

exports.register = async (req, res) => {
  const { name, email, password, role_id } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    let userRoleId = role_id;

    if (!userRoleId) {
      const defaultRole = await Role.findOne({ where: { role_name: "user" } });
      if (!defaultRole) {
        return res.status(500).json({ error: "Default role not found" });
      }
      userRoleId = defaultRole.id;
    }

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role_id: userRoleId,
    });

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(400).json({ error: "User registration failed!" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials!" });
    }

    const token = jwt.sign({ id: user.id, role_id: user.role_id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login successful!",
      name: user.name,
      user_id: user.id,
      token,
      role_id: user.role_id,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(400).json({ error: "Login failed!" });
  }
};

exports.createEvent = async (req, res, next) => {
  const { title, description, event_date } = req.body;
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ error: "No token provided. Authorization denied." });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded token:", decoded);

    const { id: createdBy, role_id } = decoded;
    console.log("Created By:", createdBy, "Role ID:", role_id);

    if (!title || !description || !event_date) {
      return res
        .status(400)
        .json({ error: "Title, description, and event date are required!" });
    }

    const existingEvent = await Event.findOne({ where: { title } });
    if (existingEvent) {
      return res
        .status(400)
        .json({ error: "An event with this title already exists!" });
    }

    const adminRole = await Role.findOne({ where: { role_name: "admin" } });

    if (!adminRole) {
      return res
        .status(500)
        .json({ error: "Admin role not found in the system" });
    }

    if (role_id !== adminRole.id) {
      return res
        .status(403)
        .json({ error: "Permission denied! Only admins can create events." });
    }

    const event = await Event.create({
      title,
      description,
      event_date,
      created_by: createdBy,
    });

    res.status(201).json({
      message: "Event created successfully!",
      event: {
        id: event.id,
        title: event.title,
        description: event.description,
        event_date: event.event_date,
        created_by: event.created_by,
      },
    });
  } catch (error) {
    console.error("Error creating event:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ error: "Invalid token." });
    }

    res.status(500).json({ error: "Failed to create event!" });
  }
};

exports.getEvents = async (req, res, next) => {
  try {
    const events = await Event.findAll();

    const eventsData = events.map((event) => {
      const eventData = {
        id: event.id,
        title: event.title,
        description: event.description,
        event_date: event.event_date,
      };

      if (req.user && req.user.role_id === adminRole.id) {
        eventData.id = event.id;
      }

      return eventData;
    });

    res.status(200).json({
      message: "Events fetched successfully!",
      events: eventsData,
    });
  } catch (error) {
    console.error("Error fetching events:", error);

    res.status(500).json({ error: "Failed to fetch events!" });
  }
};

exports.editEvent = async (req, res, next) => {
  const { title, description, new_title, new_description, new_event_date } =
    req.body;
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ error: "No token provided. Authorization denied." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded token:", decoded);

    const { id: createdBy, role_id } = decoded;
    console.log("Created By:", createdBy, "Role ID:", role_id);

    if (
      !title ||
      !description ||
      !new_title ||
      !new_description ||
      !new_event_date
    ) {
      return res.status(400).json({
        error:
          "Title, description, new title, new description, and new event date are required!",
      });
    }

    const adminRole = await Role.findOne({ where: { role_name: "admin" } });

    if (!adminRole) {
      return res
        .status(500)
        .json({ error: "Admin role not found in the system" });
    }

    if (role_id !== adminRole.id) {
      return res
        .status(403)
        .json({ error: "Permission denied! Only admins can edit events." });
    }

    const event = await Event.findOne({ where: { title, description } });

    if (!event) {
      return res.status(404).json({ error: "Event not found!" });
    }

    if (event.created_by !== createdBy && role_id !== adminRole.id) {
      return res.status(403).json({
        error: "Permission denied! You are not allowed to edit this event.",
      });
    }

    event.title = new_title;
    event.description = new_description;
    event.event_date = new_event_date;

    await event.save();

    res.status(200).json({
      message: "Event updated successfully!",
      event: {
        id: event.id,
        title: event.title,
        description: event.description,
        event_date: event.event_date,
        created_by: event.created_by,
      },
    });
  } catch (error) {
    console.error("Error updating event:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ error: "Invalid token." });
    }

    res.status(500).json({ error: "Failed to update event!" });
  }
};

exports.deleteEvent = async (req, res, next) => {
  const { eventId } = req.body;
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ error: "No token provided. Authorization denied." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded token:", decoded);

    const { id: userId, role_id } = decoded;
    console.log("User ID:", userId, "Role ID:", role_id);

    const event = await Event.findOne({ where: { id: eventId } });
    if (!event) {
      return res.status(404).json({ error: "Event not found!" });
    }

    const adminRole = await Role.findOne({ where: { role_name: "admin" } });
    if (!adminRole) {
      return res
        .status(500)
        .json({ error: "Admin role not found in the system" });
    }

    if (role_id !== adminRole.id && userId !== event.created_by) {
      return res.status(403).json({
        error:
          "Permission denied! Only admins or event creators can delete events.",
      });
    }

    await Event.destroy({ where: { id: eventId } });

    res.status(200).json({ message: "Event deleted successfully!" });
  } catch (error) {
    console.error("Error deleting event:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ error: "Invalid token." });
    }

    res.status(500).json({ error: "Failed to delete event!" });
  }
};

exports.bookEvent = async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ error: "No token provided. Authorization denied." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;
    console.log("Decoded token:", decoded);

    const { event_title, booking_date } = req.body;

    if (!event_title || !booking_date) {
      return res
        .status(400)
        .json({ error: "Event title and booking date are required." });
    }

    const event = await Event.findOne({ where: { title: event_title } });

    if (!event) {
      return res.status(404).json({ error: "Event not found!" });
    }

    const existingBooking = await Booking.findOne({
      where: {
        event_id: event.id,
      },
    });

    if (existingBooking) {
      return res.status(400).json({ error: "This event is already booked!" });
    }

    const userHasBooked = await Booking.findOne({
      where: {
        user_id: userId,
        event_id: event.id,
      },
    });

    if (userHasBooked) {
      return res
        .status(400)
        .json({ error: "You have already booked this event!" });
    }

    const booking = await Booking.create({
      user_id: userId,
      event_id: event.id,
      booking_date: booking_date,
    });

    event.is_booked = true;
    await event.save();

    res.status(201).json({
      message: "Event booked successfully!",
      booking: {
        user_id: booking.user_id,
        event_id: booking.event_id,
        booking_id: booking.id,
        booking_date: booking.booking_date,
      },
    });
  } catch (error) {
    console.error("Error booking event:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ error: "Invalid token." });
    }

    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ error: "Token has expired. Please log in again." });
    }

    res.status(500).json({ error: "Failed to book the event!" });
  }
};

exports.viewUsers = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ error: "No token provided. Authorization denied." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (user.role_id !== "60fadeda-b7d3-11ef-8c4c-3a7fce8d5812") {
      return res
        .status(403)
        .json({ error: "Access denied. Admin privileges required." });
    }

    const users = await User.findAll({
      attributes: ["id", "name", "email", "role_id"],
    });

    res.status(200).json({
      message: "Users fetched successfully!",
      users,
    });
  } catch (error) {
    console.error("Error during authentication or fetching users:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ error: "Invalid token." });
    }

    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ error: "Token has expired. Please log in again." });
    }

    res.status(500).json({ error: "Failed to fetch users." });
  }
};

exports.changeUserRole = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ error: "No token provided. Authorization denied." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const adminUser = await User.findByPk(decoded.id);

    if (!adminUser) {
      return res.status(404).json({ error: "Admin user not found." });
    }

    if (adminUser.role_id !== "60fadeda-b7d3-11ef-8c4c-3a7fce8d5812") {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    const { user_id, newRole_id } = req.body;

    if (!user_id || !newRole_id) {
      return res
        .status(400)
        .json({ error: "User ID and new role ID are required." });
    }

    const user = await User.findByPk(user_id);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    user.role_id = newRole_id;
    await user.save();

    res.status(200).json({
      message: "User role updated successfully!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role_id: user.role_id,
      },
    });
  } catch (error) {
    console.error("Error updating user role:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ error: "Invalid token." });
    }

    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ error: "Token has expired. Please log in again." });
    }

    res.status(500).json({ error: "Failed to update user role." });
  }
};

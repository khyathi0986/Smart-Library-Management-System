import React, { useState } from "react";

import { API, apiRequest } from "./api";

import { createRoot } from "react-dom/client";

import {

  BookOpen, GraduationCap, Users, ShieldCheck, Search, Bell, Sparkles,

  History, Heart, Star, BookMarked, ArrowRight, ArrowLeft, Eye, EyeOff,

  LibraryBig, LogOut, Menu, X, ChevronRight, UserRound, TrendingUp,

  CircleHelp, CheckCircle2, Sun, Moon

} from "lucide-react";

import "./styles.css";



const USER_API = API.users;

const BOOK_API = API.books;

const LIBRARY_API = API.library;

const SMART_API = API.smart;



const roleDetails = {

  Student: { icon: GraduationCap, subtitle: "Learn at your own pace", color: "blue" },

  Faculty: { icon: Users, subtitle: "Guide learning and recommend books", color: "violet" },

  Librarian: { icon: ShieldCheck, subtitle: "Manage your library operations", color: "teal" }

};



const studentItems = [

  ["Dashboard", "grid"], ["Search & View Books", "search"], ["AI Book Recommendations", "spark"],

  ["Borrowing History", "history"], ["Reading Preferences", "heart"], ["Rate & Feedback", "star"],

  ["Reading Insights", "chart"], ["Notifications", "bell"]

];




const facultyItems = [
  ["Dashboard", "grid"],
  ["Search & View Books", "search"],
  ["Recommend Books to Students", "book"],
  ["Borrowing History", "history"],
  ["Rate & Feedback", "star"],
  ["Notifications", "bell"]
];



const librarianItems = [

  ["Dashboard", "grid"], ["Manage Book Catalogue", "book"], ["Borrowing & Returns", "history"],

  ["Search & View Books", "search"], ["Library Reports", "chart"], ["Notifications", "bell"]

];



const iconFor = (key) => ({

  grid: LibraryBig, search: Search, spark: Sparkles, history: History,

  heart: Heart, star: Star, chart: TrendingUp, bell: Bell, book: BookMarked

})[key] || BookOpen;



const emptyBookForm = () => ({

  title: "",

  author: "",

  isbn: "",

  category: "",

  publisher: "",

  publicationYear: new Date().getFullYear(),

  totalCopies: 1

});



function App() {

  const [theme, setTheme] = useState(() => localStorage.getItem("smart-library-theme") || "light");

  function toggleTheme() {
    setTheme(current => {
      const next = current === "light" ? "dark" : "light";
      localStorage.setItem("smart-library-theme", next);
      return next;
    });
  }

  const [role, setRole] = useState("Student");

  const [screen, setScreen] = useState("welcome");

  const [mode, setMode] = useState("login");

  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [name, setName] = useState("");

  const [token, setToken] = useState("");

  const [user, setUser] = useState(null);

  const [notice, setNotice] = useState("");

  const [busy, setBusy] = useState(false);

  const [active, setActive] = useState("Dashboard");

  const [mobileOpen, setMobileOpen] = useState(false);

  const [query, setQuery] = useState("");



  const [books, setBooks] = useState([]);

  const [booksLoading, setBooksLoading] = useState(false);

  const [booksError, setBooksError] = useState("");

  const [editingBookId, setEditingBookId] = useState(null);

  const [bookForm, setBookForm] = useState(emptyBookForm);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState("");
  const [recommendationsNote, setRecommendationsNote] = useState("");
  const [facultyRecommendations, setFacultyRecommendations] = useState([]);
  const [facultyRecommendationsLoading, setFacultyRecommendationsLoading] = useState(false);
  const [facultyRecommendationsError, setFacultyRecommendationsError] = useState("");
  const [facultyRecommendationForm, setFacultyRecommendationForm] = useState({ bookId: "", reason: "" });
  const [facultyRecommendationSaving, setFacultyRecommendationSaving] = useState(false);
  const [loans, setLoans] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryError, setLibraryError] = useState("");
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ bookId: "", rating: 5, comment: "" });
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [preferences, setPreferences] = useState(() => {
    try { return JSON.parse(localStorage.getItem("library-reading-preferences") || "[]"); }
    catch { return []; }
  });
  const [preferencesSaved, setPreferencesSaved] = useState(false);
  const [reportLoans, setReportLoans] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState("");



  const navItems = role === "Faculty"

    ? facultyItems

    : role === "Librarian" ? librarianItems : studentItems;



  async function submitAuth(e) {

    e.preventDefault();

    setNotice("");

    setBusy(true);



    try {

      const endpoint =

        mode === "login"

          ? `${USER_API}/login`

          : `${USER_API}/register`;

      const payload = mode === "login"

        ? { email, password }

        : { name, email, password, role: role.toUpperCase() };



      const res = await fetch(endpoint, {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify(payload)

      });

      const data = await res.json().catch(() => ({}));



      if (!res.ok) {

        throw new Error(

          data.message || data.error ||

          (res.status === 401 ? "Email or password is incorrect."

            : res.status === 403 ? "This role cannot register publicly. Please contact your administrator."

            : res.status === 409 ? "An account with this email already exists."

            : `Request failed (${res.status}). Check your backend and request fields.`)

        );

      }



      if (mode === "register") {

        setNotice("Account created successfully. Please sign in.");

        setMode("login");

        setPassword("");

      } else {

        const receivedToken = data.token || data.accessToken || data.jwt;

        if (!receivedToken) {

          throw new Error("Login succeeded, but no token was found in the response. Check your login response DTO.");

        }



        setToken(receivedToken);

        const u = data.user || data;

        const normalizedRole = (u.role || role).toString()

          .replace("ROLE_", "").toLowerCase().replace(/^./, c => c.toUpperCase());



        setUser({
          id: u.id ?? u.userId ?? u.user?.id ?? u.user?.userId,
          name: u.name || email.split("@")[0],
          email: u.email || email,
          role: normalizedRole
        });

        setRole(normalizedRole);

        setScreen("app");

        setActive("Dashboard");

      }

    } catch (err) {

      setNotice(err.message || "Could not connect to User Service. Is Spring Boot running on port 8081?");

    } finally {

      setBusy(false);

    }

  }



  async function loadProfile() {

    try {

      const res = await fetch(`${USER_API}/profile`, {

        headers: { Authorization: `Bearer ${token}` },

      });

      if (!res.ok) throw new Error(`Profile request returned ${res.status}.`);

      const data = await res.json();

      setUser(data);

      setNotice("Profile refreshed from User Service.");

    } catch (e) {

      setNotice(e.message);

    }

  }



  async function loadBooks() {

    setBooksLoading(true);

    setBooksError("");



    try {

      const res = await fetch(BOOK_API);

      const data = await res.json().catch(() => []);

      if (!res.ok) {

        throw new Error(data.message || data.error || `Could not load books (${res.status}).`);

      }

      if (!Array.isArray(data)) {

        throw new Error("Book Service returned an unexpected response format.");

      }

      setBooks(data);

    } catch (err) {

      setBooksError(

        err.message?.includes("Failed to fetch")

          ? "Cannot connect to Book Service. Confirm the API Gateway is running on port 8085 and check CORS configuration."

          : err.message || "Could not load books."

      );

    } finally {

      setBooksLoading(false);

    }

  }



  async function loadRecommendations() {
    const userId = user?.id;
    if (userId == null) {
      setRecommendationsError("Your user ID was not included in the login response. Check the User Service response or refresh the profile.");
      setRecommendations([]);
      return;
    }
    setRecommendationsLoading(true);
    setRecommendationsError("");
    try {
      const data = await apiRequest(`${SMART_API}/recommendations/${userId}`, {}, token);
      setRecommendations(Array.isArray(data?.recommendations) ? data.recommendations : []);
      setRecommendationsNote(data?.note || "Recommendations are based on your feedback and available books.");
    } catch (err) {
      setRecommendationsError(err.message || "Could not load recommendations.");
      setRecommendations([]);
    } finally {
      setRecommendationsLoading(false);
    }
  }

  async function loadFacultyRecommendations() {
    setFacultyRecommendationsLoading(true);
    setFacultyRecommendationsError("");
    try {
      const path = role === "Faculty"
        ? `${SMART_API}/faculty-recommendations/faculty/${currentUserId()}`
        : `${SMART_API}/faculty-recommendations`;
      if (role === "Faculty" && currentUserId() == null) {
        throw new Error("Your account ID is missing. Please sign in again.");
      }
      const data = await apiRequest(path, {}, token);
      setFacultyRecommendations(Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : []);
    } catch (err) {
      setFacultyRecommendationsError(err.message || "Could not load faculty recommendations.");
      setFacultyRecommendations([]);
    } finally {
      setFacultyRecommendationsLoading(false);
    }
  }

  async function submitFacultyRecommendation(e) {
    e.preventDefault();
    const facultyId = currentUserId();
    const selectedBook = books.find(b => String(b.id) === String(facultyRecommendationForm.bookId));
    if (facultyId == null) { setFacultyRecommendationsError("Your account ID is missing. Please sign in again."); return; }
    if (!selectedBook) { setFacultyRecommendationsError("Choose a book from the catalogue first."); return; }
    if (!facultyRecommendationForm.reason.trim()) { setFacultyRecommendationsError("Please enter why you recommend this book."); return; }
    setFacultyRecommendationSaving(true);
    setFacultyRecommendationsError("");
    try {
      await apiRequest(`${SMART_API}/faculty-recommendations`, {
        method: "POST",
        body: JSON.stringify({
          facultyId,
          facultyName: user?.name || "Faculty",
          bookId: selectedBook.id,
          bookTitle: selectedBook.title,
          author: selectedBook.author || "",
          category: selectedBook.category || "General",
          reason: facultyRecommendationForm.reason.trim()
        })
      }, token);
      setNotice("Faculty book recommendation submitted successfully.");
      setFacultyRecommendationForm({ bookId: "", reason: "" });
      await loadFacultyRecommendations();
    } catch (err) {
      setFacultyRecommendationsError(err.message || "Could not submit this recommendation.");
    } finally {
      setFacultyRecommendationSaving(false);
    }
  }

  function currentUserId() {
    return user?.id ?? user?.userId ?? user?.user?.id ?? user?.user?.userId ?? null;
  }

  async function loadLoans() {
    const id = currentUserId();
    if (id == null) { setLibraryError("Your account ID is missing from the login response. Please refresh your profile or sign in again."); return; }
    setLibraryLoading(true); setLibraryError("");
    try {
      const [allLoans, userReservations] = await Promise.all([
        apiRequest(`${LIBRARY_API}/loans/user/${id}`, {}, token),
        apiRequest(`${LIBRARY_API}/reservations/user/${id}`, {}, token).catch(() => [])
      ]);
      setLoans(Array.isArray(allLoans) ? allLoans : Array.isArray(allLoans?.content) ? allLoans.content : []);
      setReservations(Array.isArray(userReservations) ? userReservations : Array.isArray(userReservations?.content) ? userReservations.content : []);
    } catch (e) { setLibraryError(e.message || "Could not load borrowing history."); }
    finally { setLibraryLoading(false); }
  }

  async function borrowBook(bookId) {
    const id = currentUserId();
    if (id == null) { setLibraryError("Your account ID is missing. Sign in again."); return; }
    setLibraryLoading(true); setLibraryError("");
    try {
      await apiRequest(`${LIBRARY_API}/loans`, { method: "POST", body: JSON.stringify({ userId: id, bookId: Number(bookId) }) }, token);
      setNotice("Book borrowed successfully."); await loadLoans(); await loadBooks();
    } catch (e) { setLibraryError(e.message || "Could not borrow this book."); }
    finally { setLibraryLoading(false); }
  }

  async function loanAction(loanId, action) {
    setLibraryLoading(true); setLibraryError("");
    try {
      await apiRequest(`${LIBRARY_API}/loans/${loanId}/${action}`, { method: "POST" }, token);
      setNotice(action === "return" ? "Book returned successfully." : "Loan renewed successfully.");
      await loadLoans(); await loadBooks();
    } catch (e) { setLibraryError(e.message || `Could not ${action} this loan.`); }
    finally { setLibraryLoading(false); }
  }

  async function createReservation(bookId) {
    const id = currentUserId();
    if (id == null) { setLibraryError("Your account ID is missing. Sign in again."); return; }
    setLibraryLoading(true); setLibraryError("");
    try {
      await apiRequest(`${LIBRARY_API}/reservations`, { method: "POST", body: JSON.stringify({ userId: id, bookId: Number(bookId) }) }, token);
      setNotice("Book reserved successfully."); await loadLoans();
    } catch (e) { setLibraryError(e.message || "Could not reserve this book."); }
    finally { setLibraryLoading(false); }
  }

  async function cancelReservation(reservationId) {
    setLibraryLoading(true); setLibraryError("");
    try {
      await apiRequest(`${LIBRARY_API}/reservations/${reservationId}`, { method: "DELETE" }, token);
      setNotice("Reservation cancelled."); await loadLoans();
    } catch (e) { setLibraryError(e.message || "Could not cancel reservation."); }
    finally { setLibraryLoading(false); }
  }

  async function loadFeedback() {
    const id = currentUserId();
    if (id == null) { setLibraryError("Your account ID is missing from the login response."); return; }
    setFeedbackLoading(true); setLibraryError("");
    try {
      const data = await apiRequest(`${SMART_API}/feedback/user/${id}`, {}, token);
      setFeedbackItems(Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : []);
    } catch (e) { setLibraryError(e.message || "Could not load feedback."); }
    finally { setFeedbackLoading(false); }
  }

  async function submitFeedback(e) {
    e.preventDefault();
    const id = currentUserId();
    const selectedBook = books.find(b => String(b.id) === String(feedbackForm.bookId));
    if (id == null) { setLibraryError("Your account ID is missing. Please sign in again."); return; }
    if (!selectedBook) { setLibraryError("Choose a book from the catalogue first."); return; }
    setFeedbackLoading(true); setLibraryError("");
    try {
      await apiRequest(`${SMART_API}/feedback`, { method: "POST", body: JSON.stringify({ userId: id, bookId: selectedBook.id, bookTitle: selectedBook.title, category: selectedBook.category || "General", rating: Number(feedbackForm.rating), comment: feedbackForm.comment }) }, token);
      setNotice("Your feedback was submitted."); setFeedbackForm({ bookId: "", rating: 5, comment: "" });
      await loadFeedback(); await loadRecommendations();
    } catch (e) { setLibraryError(e.message || "Could not submit feedback."); }
    finally { setFeedbackLoading(false); }
  }

  async function loadInsights() {
    const id = currentUserId();
    if (id == null) { setLibraryError("Your account ID is missing from the login response."); return; }
    setInsightsLoading(true); setLibraryError("");
    try { setInsights(await apiRequest(`${SMART_API}/insights/${id}`, {}, token)); }
    catch (e) { setLibraryError(e.message || "Could not load reading insights."); }
    finally { setInsightsLoading(false); }
  }

  async function loadNotifications() {
    const id = currentUserId();
    if (id == null) { setLibraryError("Your account ID is missing from the login response."); return; }
    setNotificationsLoading(true); setLibraryError("");
    try {
      const data = await apiRequest(`${SMART_API}/notifications/user/${id}`, {}, token);
      setNotifications(Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : []);
    } catch (e) { setLibraryError(e.message || "Could not load notifications."); }
    finally { setNotificationsLoading(false); }
  }

  async function markNotificationRead(notificationId) {
    setLibraryError("");
    try { await apiRequest(`${SMART_API}/notifications/${notificationId}/read`, { method: "PATCH" }, token); await loadNotifications(); }
    catch (e) { setLibraryError(e.message || "Could not update notification."); }
  }

  async function loadReports() {
    setReportsLoading(true);
    setReportsError("");
    try {
      const [bookData, loanData] = await Promise.all([
        apiRequest(BOOK_API, {}, token),
        apiRequest(`${LIBRARY_API}/loans`, {}, token)
      ]);
      const bookList = Array.isArray(bookData) ? bookData : Array.isArray(bookData?.content) ? bookData.content : [];
      const loanList = Array.isArray(loanData) ? loanData : Array.isArray(loanData?.content) ? loanData.content : [];
      setBooks(bookList);
      setReportLoans(loanList);
    } catch (e) {
      setReportsError(e.message || "Could not load library reports. Check Book Service and Library Service.");
    } finally {
      setReportsLoading(false);
    }
  }

  function savePreferences() {
    localStorage.setItem("library-reading-preferences", JSON.stringify(preferences));
    setPreferencesSaved(true);
    setNotice("Reading preferences saved in this browser. Your Smart Service recommendations still use submitted book feedback.");
  }

  function openModule(label) {
    setActive(label); setMobileOpen(false); setNotice(""); setLibraryError("");
    if (label === "Borrowing History" || label === "Borrowing & Returns") { loadBooks(); loadLoans(); }
    if (label === "Rate & Feedback") { loadBooks(); loadFeedback(); }
    if (label === "Reading Insights") loadInsights();
    if (label === "Notifications") loadNotifications();
    if (label === "AI Book Recommendations") loadRecommendations();
    if (label === "Recommend Books to Students") { loadBooks(); loadFacultyRecommendations(); }
    if (label === "Faculty Book Recommendations") loadFacultyRecommendations();
    if (label === "Library Reports") loadReports();
  }

  function openCatalogue(destination) {

    setActive(destination);

    setMobileOpen(false);

    setNotice("");

    setQuery("");

    setBooksError("");

    loadBooks();

  }



  function resetBookForm() {

    setEditingBookId(null);

    setBookForm(emptyBookForm());

  }



  function editBook(book) {

    setEditingBookId(book.id);

    setBookForm({

      title: book.title || "",

      author: book.author || "",

      isbn: book.isbn || "",

      category: book.category || "",

      publisher: book.publisher || "",

      publicationYear: book.publicationYear || new Date().getFullYear(),

      totalCopies: book.totalCopies ?? 1

    });

    window.scrollTo({ top: 0, behavior: "smooth" });

  }



  async function saveBook(e) {

    e.preventDefault();

    setNotice("");

    setBooksError("");



    const payload = {

      ...bookForm,

      publicationYear: Number(bookForm.publicationYear),

      totalCopies: Number(bookForm.totalCopies)

    };



    try {

      const res = await fetch(

        editingBookId ? `${BOOK_API}/${editingBookId}` : BOOK_API,

        {

          method: editingBookId ? "PUT" : "POST",

          headers: {

            "Content-Type": "application/json",

            "Authorization": `Bearer ${token}`

          },

          body: JSON.stringify(payload)

        }

      );



      const data = await res.json().catch(() => ({}));

      if (!res.ok) {

        throw new Error(data.message || data.error || `Save failed (${res.status}).`);

      }



      setNotice(editingBookId ? "Book updated successfully." : "Book added successfully.");

      resetBookForm();

      await loadBooks();

    } catch (err) {

      setBooksError(

        err.message?.includes("Failed to fetch")

          ? "Could not reach Book Service. Check that the API Gateway is running on port 8085 and CORS is configured."

          : err.message || "Could not save book."

      );

    }

  }



  async function deleteBook(id) {

    if (!window.confirm("Remove this book from the catalogue?")) return;



    setNotice("");

    setBooksError("");



    try {

      const res = await fetch(`${BOOK_API}/${id}`, {

        method: "DELETE",

        headers: {

          "Authorization": `Bearer ${token}`

        }

      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {

        throw new Error(data.message || data.error || `Delete failed (${res.status}).`);

      }



      setNotice("Book removed from the catalogue.");

      if (editingBookId === id) resetBookForm();

      await loadBooks();

    } catch (err) {

      setBooksError(

        err.message?.includes("Failed to fetch")

          ? "Could not reach Book Service. Check that the API Gateway is running on port 8085 and CORS is configured."

          : err.message || "Could not remove book."

      );

    }

  }



  function logout() {

    setToken("");

    setUser(null);

    setEmail("");

    setPassword("");

    setScreen("welcome");

    setNotice("");

    setActive("Dashboard");

    resetBookForm();

  }



  if (screen === "welcome") {

    return (

      <div className={`welcome-shell theme-${theme}`}>

        <div className="welcome-bg bg-one" />

        <div className="welcome-bg bg-two" />

        <header className="topbar">

          <div className="brand">

            <div className="brand-mark"><BookOpen size={23} /></div>

            <div><b>VIT Library</b><span>SMART CAMPUS PORTAL</span></div>

          </div>

          <div className="welcome-actions"><div className="top-links"><span className="status-dot" /> Campus Library Portal <span className="top-sep">•</span> Secure access</div><button className="theme-toggle" onClick={toggleTheme} type="button" aria-label="Toggle dark and light mode">{theme === "light" ? <Moon size={19} /> : <Sun size={19} />}<span>{theme === "light" ? "Dark mode" : "Light mode"}</span></button></div>

        </header>



        <main className="welcome-main">

          <section className="hero-copy">

            <div className="eyebrow"><Sparkles size={14} /> YOUR CAMPUS. YOUR KNOWLEDGE.</div>

            <h1>Every great idea<br />starts with a <em>book.</em></h1>

            <p>Discover your next read, manage your borrowing, and make your campus library work smarter for you.</p>

            <div className="hero-stats">

              <div><strong>Explore</strong><span>Thousands of titles</span></div>

              <div><strong>Discover</strong><span>Personalized reads</span></div>

              <div><strong>Learn</strong><span>Without limits</span></div>

            </div>

            <div className="hero-note">

              <div className="note-icon"><ShieldCheck size={18} /></div>

              <span><b>One secure campus sign-in</b><small>Choose your role to continue to your library workspace.</small></span>

            </div>

          </section>



          <section className="auth-card">

            <div className="card-heading">

              <div className="mini-icon"><LibraryBig size={21} /></div>

              <div>

                <div className="eyebrow dark-eyebrow">WELCOME TO YOUR LIBRARY</div>

                <h2>{mode === "login" ? "Sign in to continue" : "Create your account"}</h2>

                <p>Access your personalized library portal.</p>

              </div>

            </div>



            <div className="role-label">I'M SIGNING IN AS</div>

            <div className="role-grid">

              {Object.entries(roleDetails).map(([r, d]) => {

                const Icon = d.icon;

                return (

                  <button key={r} type="button" className={`role-choice ${role === r ? "selected" : ""}`}

                    onClick={() => { setRole(r); setNotice(""); }}>

                    <span className={`role-icon ${d.color}`}><Icon size={19} /></span>

                    <span className="role-text"><b>{r}</b><small>{d.subtitle}</small></span>

                    <span className="radio">{role === r && <span />}</span>

                  </button>

                );

              })}

            </div>



            {role === "Librarian" && (

              <div className="role-warning"><ShieldCheck size={16} /> Librarian accounts are provisioned by the library administrator.</div>

            )}



            <form className="auth-form" onSubmit={submitAuth}>

              {mode === "register" && (

                <label>Full name

                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Enter your full name" required autoComplete="name" />

                </label>

              )}

              <label>Campus email

                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@university.edu" required autoComplete="email" />

              </label>

              <label>Password

                <div className="password-wrap">

                  <input type={showPassword ? "text" : "password"} value={password}

                    onChange={e => setPassword(e.target.value)} placeholder="Enter your password"

                    required minLength={6} autoComplete={mode === "login" ? "current-password" : "new-password"} />

                  <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility">

                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}

                  </button>

                </div>

              </label>

              {mode === "login" && (

                <div className="form-options">

                  <label className="remember"><input type="checkbox" /> <span>Remember me</span></label>

                  <button type="button" className="text-button" onClick={() => setNotice("For password assistance, contact your library administrator.")}>Forgot password?</button>

                </div>

              )}

              {notice && <div className={`notice ${notice.includes("successfully") ? "success" : ""}`}>{notice}</div>}

              <button className="primary-btn" disabled={busy || (role === "Librarian" && mode === "register")} type="submit">

                {busy ? "Please wait…" : mode === "login" ? "Sign in to portal" : "Create account"} <ArrowRight size={17} />

              </button>

            </form>



            <div className="switch-mode">

              {mode === "login" ? "New to the library?" : "Already have an account?"}

              <button className="text-button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setNotice(""); }}>

                {mode === "login" ? "Create account" : "Sign in"}

              </button>

            </div>

            <div className="auth-footer"><ShieldCheck size={14} /> Your credentials are sent securely to the User Service.</div>

          </section>

        </main>



        <footer className="site-footer">

          <span>© 2026 Smart Library Management System</span>

          <span>Built for a smarter campus <span className="footer-heart">♥</span></span>

        </footer>

      </div>

    );

  }



  const moduleScreen = active === "Search & View Books" || active === "Manage Book Catalogue";



  return (

    <div className={`app-shell theme-${theme}`}>

      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>

        <div className="sidebar-brand">

          <div className="brand-mark"><BookOpen size={22} /></div>

          <div><b>VIT Library</b><span>SMART CAMPUS</span></div>

          <button className="mobile-close" onClick={() => setMobileOpen(false)}><X size={18} /></button>

        </div>

        <div className="workspace-label">YOUR WORKSPACE</div>

        <div className="side-user">

          <div className="avatar">{(user?.name || role)[0]?.toUpperCase()}</div>

          <div><b>{user?.name || role}</b><span>{role} account</span></div>

          <span className="online-dot" />

        </div>



        <nav>

          {navItems.map(([label, key]) => {

            const Icon = iconFor(key);

            return (

              <button key={label} className={`nav-item ${active === label ? "active" : ""}`}

                onClick={() => {

                  if (label === "Search & View Books" || label === "Manage Book Catalogue") {

                    openCatalogue(label);

                  } else {

                    openModule(label);

                  }

                }}>

                <Icon size={18} /><span>{label}</span>

                {active === label && <ChevronRight size={15} className="nav-chevron" />}

              </button>

            );

          })}

        </nav>



        <div className="sidebar-bottom">

          <div className="help-box"><CircleHelp size={18} /><b>Need help?</b><p>Contact your library support team.</p></div>

          <button className="logout-btn" onClick={logout}><LogOut size={17} /> Sign out</button>

          <small>Smart Library · v1.0</small>

        </div>

      </aside>



      {mobileOpen && <div className="mobile-scrim" onClick={() => setMobileOpen(false)} />}



      <main className="dashboard-main">

        <header className="dash-topbar">

          <button className="mobile-menu" onClick={() => setMobileOpen(true)}><Menu size={21} /></button>

          <div className="breadcrumb">Workspace <ChevronRight size={14} /> <b>{active}</b></div>

          <div className="dash-top-actions">

            <button className="theme-toggle" onClick={toggleTheme} type="button" aria-label="Toggle dark and light mode">{theme === "light" ? <Moon size={19} /> : <Sun size={19} />}<span>{theme === "light" ? "Dark mode" : "Light mode"}</span></button>

            <button className="icon-btn" onClick={() => { setActive("Notifications"); setNotice(""); }} aria-label="Notifications"><Bell size={18} /><i /></button>

            <div className="top-profile">

              <div className="avatar small-avatar">{(user?.name || role)[0]?.toUpperCase()}</div>

              <div><b>{user?.name || role}</b><span>{role}</span></div>

            </div>

          </div>

        </header>



        <div className="dashboard-content">

          <div className="welcome-row">

            <div>

              <div className="eyebrow dark-eyebrow">YOUR CAMPUS LIBRARY</div>

              <h1>{active === "Dashboard" ? `Good to have you here, ${(user?.name || role).split(" ")[0]}!` : active}</h1>

              <p>{active === "Dashboard" ? "Your reading journey, all in one place. Here's your library at a glance." : `Welcome to ${active.toLowerCase()}.`}</p>

            </div>

            <button className="outline-btn" onClick={loadProfile}><UserRound size={16} /> Refresh profile</button>

          </div>



          {notice && <div className={`notice dashboard-notice ${notice.includes("successfully") || notice.includes("refreshed") ? "success" : ""}`}>{notice}</div>}



          {active === "Dashboard" ? (

            <>

              <section className="dashboard-hero">

                <div className="hero-art">

                  <div className="art-orbit orbit-a" /><div className="art-orbit orbit-b" />

                  <div className="floating-book book-a"><BookOpen size={29} /></div>

                  <div className="floating-book book-b"><BookMarked size={24} /></div>

                  <div className="art-spark spark-a">✦</div><div className="art-spark spark-b">✧</div>

                </div>

                <div className="dash-hero-copy">

                  <div className="hero-pill"><Sparkles size={13} /> YOUR LIBRARY, REIMAGINED</div>

                  <h2>{role === "Faculty" ? "Inspire the next big idea." : role === "Librarian" ? "Your library. In perfect order." : "Find your next favourite book."}</h2>

                  <p>{role === "Faculty" ? "Share valuable reads with students and help shape their learning journey." : role === "Librarian" ? "Keep the catalogue organized and help your campus community discover more." : "Search the catalogue, discover tailored recommendations, and keep track of your reading."}</p>

                  <button className="hero-cta" onClick={() => openCatalogue(role === "Librarian" ? "Manage Book Catalogue" : "Search & View Books")}>

                    {role === "Librarian" ? "Manage catalogue" : "Explore library"} <ArrowRight size={16} />

                  </button>

                </div>

              </section>



              <div className="section-title">

                <div><h2>Your library shortcuts</h2><p>Jump back into what matters to you.</p></div>

                <span className="section-tag"><CheckCircle2 size={14} /> Signed in securely</span>

              </div>



              <div className="shortcut-grid">

                {navItems.filter(i => i[0] !== "Dashboard").slice(0, 6).map(([label, key], i) => {

                  const Icon = iconFor(key);

                  return (

                    <button key={label} className="shortcut-card" onClick={() => {

                      if (label === "Search & View Books" || label === "Manage Book Catalogue") openCatalogue(label);

                      else openModule(label);

                    }}>

                      <div className={`shortcut-icon tone-${i % 5}`}><Icon size={20} /></div>

                      <div className="shortcut-name">{label}</div>

                      <span className="shortcut-arrow"><ArrowRight size={16} /></span>

                    </button>

                  );

                })}

              </div>



              <div className="bottom-panels">

                <section className="panel">

                  <div className="panel-heading"><div><h3>Recently explored</h3><p>Your library activity will appear here.</p></div><History size={19} /></div>

                  <div className="empty-state">

                    <div className="empty-icon"><BookOpen size={22} /></div><b>Your reading story starts here</b>

                    <span>Search for a book to start building your library activity.</span>

                    <button className="text-button" onClick={() => openCatalogue("Search & View Books")}>Find a book <ArrowRight size={14} /></button>

                  </div>

                </section>

                <section className="panel insight-panel">

                  <div className="panel-heading"><div><h3>Smart reading</h3><p>Little discoveries, big ideas.</p></div><Sparkles size={19} /></div>

                  <div className="insight-content">

                    <div className="insight-art"><Sparkles size={27} /></div><b>Discover something unexpected</b>

                    <span>Your personalized recommendations will show here once the Smart Service is connected.</span>

                    <button className="secondary-btn" onClick={() => openModule(role === "Faculty" ? "Recommend Books to Students" : "AI Book Recommendations")}>Explore recommendations <ArrowRight size={14} /></button>

                  </div>

                </section>

              </div>

            </>

          ) : moduleScreen ? (

            <section className="module-page">

              <div className="module-icon"><BookOpen size={26} /></div>

              <h2>{active}</h2>

              <p>Live catalogue powered by Book Service.</p>



              <div className="search-box">

                <Search size={18} />

                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by title, author, ISBN, or category..." />

              </div>



              <div className="catalogue-toolbar">

                <span>{books.length} book record(s)</span>

                <button className="outline-btn" onClick={loadBooks} disabled={booksLoading}>

                  {booksLoading ? "Refreshing..." : "Refresh catalogue"}

                </button>

              </div>



              {role === "Librarian" && active === "Manage Book Catalogue" && (

                <form className="book-form" onSubmit={saveBook}>

                  <h3>{editingBookId !== null ? "Edit book" : "Add a new book"}</h3>

                  {[

                    ["title", "Title", "text"],

                    ["author", "Author", "text"],

                    ["isbn", "ISBN", "text"],

                    ["category", "Category", "text"],

                    ["publisher", "Publisher", "text"],

                    ["publicationYear", "Publication year", "number"],

                    ["totalCopies", "Total copies", "number"]

                  ].map(([field, label, type]) => (

                    <label key={field}>{label}

                      <input

                        required

                        type={type}

                        min={type === "number" ? 1 : undefined}

                        value={bookForm[field]}

                        onChange={e => setBookForm({ ...bookForm, [field]: e.target.value })}

                      />

                    </label>

                  ))}

                  <button className="primary-btn" type="submit">{editingBookId !== null ? "Save changes" : "Add book"}</button>

                  {editingBookId !== null && <button className="outline-btn" type="button" onClick={resetBookForm}>Cancel editing</button>}

                </form>

              )}



              {booksError && <div className="notice">{booksError}</div>}

              {booksLoading && <p>Loading books...</p>}



              {!booksLoading && !booksError && (

                <div className="book-grid">

                  {books

                    .filter(book => book.active !== false)

                    .filter(book => `${book.title || ""} ${book.author || ""} ${book.isbn || ""} ${book.category || ""}`.toLowerCase().includes(query.toLowerCase()))

                    .map(book => (

                      <article className="book-card" key={book.id}>

                        <div className="book-card-icon"><BookOpen size={25} /></div>

                        <h3>{book.title}</h3>

                        <p>By {book.author}</p>

                        <p>Category: {book.category || "Not specified"}</p>

                        <p>ISBN: {book.isbn}</p>

                        <p>Publisher: {book.publisher || "Not specified"}</p>

                        <p>Publication year: {book.publicationYear || "Not specified"}</p>

                        <p>Available copies: {book.availableCopies ?? 0} / {book.totalCopies ?? 0}</p>

                        {role === "Librarian" && active === "Manage Book Catalogue" && (

                          <div className="book-actions">

                            <button className="outline-btn" onClick={() => editBook(book)}>Edit</button>

                            <button className="outline-btn" onClick={() => deleteBook(book.id)}>Remove</button>

                          </div>

                        )}

                      </article>

                    ))}

                  {books.filter(book => book.active !== false).filter(book => `${book.title || ""} ${book.author || ""} ${book.isbn || ""} ${book.category || ""}`.toLowerCase().includes(query.toLowerCase())).length === 0 && (

                    <p>No matching books found.</p>

                  )}

                </div>

              )}

            </section>

          ) : active === "Borrowing & Returns" || active === "Borrowing History" ? (
            <section className="module-page">
              <div className="module-icon"><History size={26} /></div>
              <h2>Borrowing history & reservations</h2>
              <p>Live loans and reservations from Library Service.</p>
              <div className="catalogue-toolbar"><span>{loans.length} loan record(s)</span><button className="outline-btn" onClick={loadLoans} disabled={libraryLoading}>{libraryLoading ? "Refreshing…" : "Refresh activity"}</button></div>
              {libraryError && <div className="notice">{libraryError}</div>}
              {libraryLoading && <p>Loading library activity…</p>}
              {!libraryLoading && loans.map(loan => <article className="book-card" key={loan.id}><h3>{loan.bookTitle || `Book #${loan.bookId}`}</h3><p>Loan ID: {loan.id} · Status: {loan.status}</p><p>Borrowed: {loan.borrowDate || "—"} · Due: {loan.dueDate || "—"}</p><p>Fine: {loan.fine ?? 0} · Renewals: {loan.renewalCount ?? 0}</p>{String(loan.status).toUpperCase() === "BORROWED" && <div className="book-actions"><button className="outline-btn" onClick={() => loanAction(loan.id, "return")} disabled={libraryLoading}>Return</button><button className="outline-btn" onClick={() => loanAction(loan.id, "renew")} disabled={libraryLoading}>Renew</button></div>}</article>)}
              <h3>Reservations</h3>
              {reservations.map(res => <article className="book-card" key={res.id}><p>{res.bookTitle || `Book #${res.bookId}`} · {res.status || "WAITING"}</p>{String(res.status).toUpperCase() !== "CANCELLED" && <button className="outline-btn" onClick={() => cancelReservation(res.id)} disabled={libraryLoading}>Cancel reservation</button>}</article>)}
              <h3>Borrow or reserve a book</h3>
              <div className="book-grid">{books.filter(b => b.active !== false).map(book => <article className="book-card" key={book.id}><h3>{book.title}</h3><p>By {book.author}</p><p>Available: {book.availableCopies ?? 0}</p><div className="book-actions"><button className="outline-btn" onClick={() => borrowBook(book.id)} disabled={libraryLoading || !(book.availableCopies > 0)}>Borrow</button><button className="outline-btn" onClick={() => createReservation(book.id)} disabled={libraryLoading}>Reserve</button></div></article>)}</div>
            </section>
          ) : active === "Library Reports" ? (
            <section className="module-page reports-page">
              <div className="module-icon"><TrendingUp size={26} /></div>
              <h2>Library Reports</h2>
              <p>Live summary generated from the Book Service catalogue and Library Service loan records.</p>
              <div className="catalogue-toolbar">
                <span>Catalogue and circulation overview</span>
                <button className="outline-btn" onClick={loadReports} disabled={reportsLoading}>
                  {reportsLoading ? "Refreshing reports…" : "Refresh reports"}
                </button>
              </div>
              {reportsError && <div className="notice">{reportsError}</div>}
              {reportsLoading && <p>Loading report data…</p>}
              {!reportsLoading && !reportsError && (() => {
                const activeBooks = books.filter(b => b.active !== false);
                const totalCopies = activeBooks.reduce((sum, b) => sum + Number(b.totalCopies || 0), 0);
                const availableCopies = activeBooks.reduce((sum, b) => sum + Number(b.availableCopies || 0), 0);
                const borrowedLoans = reportLoans.filter(l => String(l.status).toUpperCase() === "BORROWED");
                const returnedLoans = reportLoans.filter(l => String(l.status).toUpperCase() === "RETURNED");
                const overdueLoans = borrowedLoans.filter(l => l.dueDate && new Date(`${l.dueDate}T23:59:59`) < new Date());
                const categories = activeBooks.reduce((acc, b) => { const c = b.category || "Uncategorised"; acc[c] = (acc[c] || 0) + 1; return acc; }, {});
                return <>
                  <div className="report-metrics">
                    <article className="report-metric"><span>Active titles</span><strong>{activeBooks.length}</strong><small>Distinct catalogue records</small></article>
                    <article className="report-metric"><span>Total copies</span><strong>{totalCopies}</strong><small>Across active titles</small></article>
                    <article className="report-metric"><span>Available copies</span><strong>{availableCopies}</strong><small>Currently available</small></article>
                    <article className="report-metric"><span>Active loans</span><strong>{borrowedLoans.length}</strong><small>Currently borrowed</small></article>
                    <article className="report-metric"><span>Returned loans</span><strong>{returnedLoans.length}</strong><small>Completed returns</small></article>
                    <article className="report-metric"><span>Overdue loans</span><strong>{overdueLoans.length}</strong><small>Past due date and not returned</small></article>
                  </div>
                  <div className="report-columns">
                    <section className="report-panel"><h3>Catalogue by category</h3>
                      {Object.keys(categories).length ? Object.entries(categories).sort((a,b) => b[1]-a[1]).map(([category,count]) => <div className="report-bar-row" key={category}><span>{category}</span><div className="report-bar-track"><div className="report-bar-fill" style={{width:`${Math.max(5, count / Math.max(...Object.values(categories)) * 100)}%`}} /></div><strong>{count}</strong></div>) : <p>No catalogue records found.</p>}
                    </section>
                    <section className="report-panel"><h3>Circulation status</h3><p><strong>{reportLoans.length}</strong> total loan records</p><p><strong>{borrowedLoans.length}</strong> currently borrowed</p><p><strong>{returnedLoans.length}</strong> returned</p><p><strong>{overdueLoans.length}</strong> potentially overdue</p><small>Reports are calculated from current service data; no sample values are fabricated.</small></section>
                  </div>
                  <section className="report-panel report-table-panel"><h3>Recent loan records</h3>
                    {reportLoans.length === 0 ? <p>No loan records are available yet.</p> : <div className="report-table-wrap"><table className="report-table"><thead><tr><th>Loan ID</th><th>User ID</th><th>Book ID</th><th>Status</th><th>Borrowed</th><th>Due date</th><th>Fine</th></tr></thead><tbody>{[...reportLoans].sort((a,b) => Number(b.id || 0)-Number(a.id || 0)).slice(0,12).map(loan => <tr key={loan.id}><td>{loan.id}</td><td>{loan.userId ?? "—"}</td><td>{loan.bookId ?? "—"}</td><td><span className={`report-status status-${String(loan.status || "unknown").toLowerCase()}`}>{loan.status || "Unknown"}</span></td><td>{loan.borrowDate || "—"}</td><td>{loan.dueDate || "—"}</td><td>{loan.fine ?? 0}</td></tr>)}</tbody></table></div>}
                  </section>
                </>;
              })()}
            </section>

          ) : active === "Recommend Books to Students" || active === "Faculty Book Recommendations" ? (
            <section className="module-page">
              <div className="module-icon"><BookMarked size={26} /></div>
              <h2>{active}</h2>
              <p>{role === "Faculty" ? "Choose a book from the live catalogue and explain why students should read it." : "Discover books recommended by your faculty members."}</p>
              {facultyRecommendationsError && <div className="notice">{facultyRecommendationsError}</div>}
              {role === "Faculty" && (
                <form className="book-form" onSubmit={submitFacultyRecommendation}>
                  <h3>Recommend a book to students</h3>
                  <label>Book from catalogue
                    <select required value={facultyRecommendationForm.bookId} onChange={e => setFacultyRecommendationForm({ ...facultyRecommendationForm, bookId: e.target.value })}>
                      <option value="">Choose a book</option>
                      {books.filter(b => b.active !== false).map(b => <option key={b.id} value={b.id}>{b.title} — {b.author || "Unknown author"}</option>)}
                    </select>
                  </label>
                  <label>Why do you recommend this book?
                    <textarea required maxLength={1000} value={facultyRecommendationForm.reason} onChange={e => setFacultyRecommendationForm({ ...facultyRecommendationForm, reason: e.target.value })} placeholder="Explain how this book can help students learn..." />
                  </label>
                  <button className="primary-btn" type="submit" disabled={facultyRecommendationSaving || booksLoading}>
                    {facultyRecommendationSaving ? "Submitting…" : "Submit recommendation"}
                  </button>
                </form>
              )}
              <div className="catalogue-toolbar">
                <h3>{role === "Faculty" ? "My submitted recommendations" : "Recommended by faculty"}</h3>
                <button className="outline-btn" onClick={() => { if (role === "Faculty") loadBooks(); loadFacultyRecommendations(); }} disabled={facultyRecommendationsLoading}>
                  {facultyRecommendationsLoading ? "Refreshing…" : "Refresh list"}
                </button>
              </div>
              {facultyRecommendationsLoading && <p>Loading faculty recommendations…</p>}
              {!facultyRecommendationsLoading && facultyRecommendations.length > 0 && (
                <div className="book-grid">
                  {facultyRecommendations.map(rec => (
                    <article className="book-card" key={rec.id}>
                      <div className="book-card-icon"><BookOpen size={25} /></div>
                      <h3>{rec.bookTitle || `Book #${rec.bookId}`}</h3>
                      <p>By {rec.author || "Unknown author"}</p>
                      <p>Category: {rec.category || "Not specified"}</p>
                      {role !== "Faculty" && <p><strong>Recommended by:</strong> {rec.facultyName || `Faculty #${rec.facultyId}`}</p>}
                      <p><strong>Why this book?</strong> {rec.reason}</p>
                      <p><small>Recommended on: {rec.createdAt ? new Date(rec.createdAt).toLocaleDateString() : "Date unavailable"}</small></p>
                    </article>
                  ))}
                </div>
              )}
              {!facultyRecommendationsLoading && !facultyRecommendationsError && facultyRecommendations.length === 0 && (
                <p>{role === "Faculty" ? "You have not submitted any recommendations yet." : "No faculty recommendations have been posted yet."}</p>
              )}
            </section>
          ) : active === "AI Book Recommendations" ? (
             <section className="module-page">
              <div className="module-icon"><Sparkles size={26} /></div>
              <h2>{active}</h2>
              <p>Personalized suggestions based on your feedback and available library books.</p>
              <button className="primary-btn" onClick={loadRecommendations} disabled={recommendationsLoading}>
                {recommendationsLoading ? "Finding books…" : "Get my recommendations"}
              </button>
              {recommendationsError && <div className="notice">{recommendationsError}</div>}
              {recommendationsNote && recommendations.length > 0 && <p>{recommendationsNote}</p>}
              {!recommendationsLoading && !recommendationsError && recommendations.length > 0 && (
                <div className="book-grid">
                  {recommendations.map((book) => (
                    <article className="book-card" key={book.bookId ?? book.id ?? book.title}>
                      <div className="book-card-icon"><BookOpen size={25} /></div>
                      <h3>{book.title || "Untitled book"}</h3>
                      <p>By {book.author || "Unknown author"}</p>
                      <p>Category: {book.category || "Not specified"}</p>
                      <p>Available copies: {book.availableCopies ?? "Not reported"}</p>
                      <p><strong>Why recommended:</strong> {book.reason || "Suggested for your reading interests."}</p>
                    </article>
                  ))}
                </div>
              )}
              {!recommendationsLoading && !recommendationsError && recommendations.length === 0 && (
                <p>Click “Get my recommendations” to discover books. If no books appear, submit positive feedback and try again.</p>
              )}
              <button className="outline-btn" onClick={() => setActive("Dashboard")}><ArrowLeft size={15} /> Back to dashboard</button>
            </section>
          ) : active === "Rate & Feedback" ? (
            <section className="module-page">
              <div className="module-icon"><Star size={26} /></div><h2>Rate & Feedback</h2>
              <p>Your feedback is stored by Smart Service and helps personalize recommendations.</p>
              {libraryError && <div className="notice">{libraryError}</div>}
              <form className="book-form" onSubmit={submitFeedback}>
                <label>Book<select required value={feedbackForm.bookId} onChange={e => setFeedbackForm({...feedbackForm, bookId:e.target.value})}><option value="">Choose a book</option>{books.map(b=><option key={b.id} value={b.id}>{b.title}</option>)}</select></label>
                <label>Rating<select value={feedbackForm.rating} onChange={e=>setFeedbackForm({...feedbackForm,rating:e.target.value})}>{[5,4,3,2,1].map(n=><option key={n} value={n}>{n} star{n>1?"s":""}</option>)}</select></label>
                <label>Comment<textarea required value={feedbackForm.comment} onChange={e=>setFeedbackForm({...feedbackForm,comment:e.target.value})} placeholder="What did you think of this book?" /></label>
                <button className="primary-btn" disabled={feedbackLoading} type="submit">{feedbackLoading?"Submitting…":"Submit feedback"}</button>
              </form>
              <div className="catalogue-toolbar"><h3>Your previous feedback</h3><button className="outline-btn" onClick={loadFeedback} disabled={feedbackLoading}>Refresh</button></div>
              {feedbackItems.map(f=><article className="book-card" key={f.id}><h3>{f.bookTitle || `Book #${f.bookId}`}</h3><p>Rating: {f.rating}/5</p><p>{f.comment}</p><p>Category: {f.category || "General"}</p></article>)}
              {!feedbackItems.length && !feedbackLoading && <p>No feedback submitted yet.</p>}
            </section>
          ) : active === "Reading Preferences" ? (
            <section className="module-page"><div className="module-icon"><Heart size={26}/></div><h2>Reading Preferences</h2><p>Select categories you enjoy. These preferences are saved in this browser; recommendations currently learn from submitted book feedback.</p>
              <div className="book-grid">{["Programming","Artificial Intelligence","Database","Networking","Mathematics","Software Engineering","Cybersecurity","Science Fiction","Business","Self Development"].map(category=><label className="book-card" key={category} style={{display:"flex",gap:12,alignItems:"center"}}><input type="checkbox" checked={preferences.includes(category)} onChange={e=>{setPreferences(prev=>e.target.checked?[...prev,category]:prev.filter(x=>x!==category));setPreferencesSaved(false);}}/>{category}</label>)}</div>
              <button className="primary-btn" onClick={savePreferences}>Save preferences</button>{preferencesSaved&&<p>Preferences saved.</p>}</section>
          ) : active === "Reading Insights" ? (
            <section className="module-page"><div className="module-icon"><TrendingUp size={26}/></div><h2>Reading Insights</h2><p>Reading statistics retrieved from Smart Service.</p><button className="outline-btn" onClick={loadInsights} disabled={insightsLoading}>{insightsLoading?"Refreshing…":"Refresh insights"}</button>{libraryError&&<div className="notice">{libraryError}</div>}{insightsLoading&&<p>Loading insights…</p>}{insights&&<div className="book-grid">{Object.entries(insights).map(([key,value])=><article className="book-card" key={key}><h3>{key.replace(/([A-Z])/g," $1").replace(/^./,c=>c.toUpperCase())}</h3><p>{typeof value==="object"?JSON.stringify(value):String(value ?? "—")}</p></article>)}</div>}</section>
          ) : active === "Notifications" ? (
            <section className="module-page"><div className="module-icon"><Bell size={26}/></div><h2>Notifications</h2><p>Messages from Smart Service.</p><div className="catalogue-toolbar"><span>{notifications.filter(n=>!n.read).length} unread</span><button className="outline-btn" onClick={loadNotifications} disabled={notificationsLoading}>{notificationsLoading?"Refreshing…":"Refresh notifications"}</button></div>{libraryError&&<div className="notice">{libraryError}</div>}{notifications.map(n=><article className="book-card" key={n.id}><h3>{n.type || "Notification"}</h3><p>{n.message}</p><p>{n.createdAt || ""}</p>{n.read?<span>Read</span>:<button className="outline-btn" onClick={()=>markNotificationRead(n.id)}>Mark as read</button>}</article>)}{!notifications.length&&!notificationsLoading&&<p>No notifications found.</p>}</section>
          ) : (
            <section className="module-page"><div className="module-icon"><Sparkles size={26}/></div><h2>{active}</h2><p>This feature will be connected when its corresponding service is ready.</p><button className="outline-btn" onClick={()=>setActive("Dashboard")}><ArrowLeft size={15}/> Back to dashboard</button></section>
          )}


          <footer className="dash-footer">

            <span>Smart Library Management System</span><span>Signed in as <b>{role}</b></span>

          </footer>

        </div>

      </main>

    </div>

  );

}



createRoot(document.getElementById("root")).render(<App />);

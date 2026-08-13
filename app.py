import os
from flask import Flask, render_template


def create_app():
    app = Flask(__name__, static_folder="static", template_folder="templates")
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "semester-cracker-local-only")
    app.config["JSON_SORT_KEYS"] = False

    @app.route("/")
    @app.route("/dashboard")
    def dashboard():
        return render_template("dashboard.html", page="dashboard")

    @app.route("/tasks")
    def tasks():
        return render_template("tasks.html", page="tasks")

    @app.route("/notes")
    def notes():
        return render_template("notes.html", page="notes")

    @app.route("/attendance")
    def attendance():
        return render_template("attendance.html", page="attendance")

    @app.route("/cgpa")
    def cgpa():
        return render_template("cgpa.html", page="cgpa")

    @app.route("/planner")
    def planner():
        return render_template("planner.html", page="planner")

    @app.route("/pomodoro")
    def pomodoro():
        return render_template("pomodoro.html", page="pomodoro")

    @app.route("/analytics")
    def analytics():
        return render_template("analytics.html", page="analytics")

    @app.route("/pdf-vault")
    def pdf_vault():
        return render_template("pdf_vault.html", page="pdf-vault")

    @app.route("/settings")
    def settings():
        return render_template("settings.html", page="settings")

    @app.route("/health")
    def health():
        return {"status": "ok", "app": "Semester Cracker"}

    @app.route("/__debug_500__")
    def debug_500():
        raise RuntimeError("Forced test 500")

    @app.errorhandler(404)
    def not_found(_error):
        return render_template("404.html"), 404

    @app.errorhandler(500)
    def server_error(_error):
        return render_template("500.html"), 500

    return app


app = create_app()


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", "5000")),
        debug=False,
    )

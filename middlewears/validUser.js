export const isValid = (req, res, next) => {
    if (req.session.isLoggedIn) {
      next();
    } else {
      req.session.error = "You have to login first";
      res.redirect("/login");
    }
  };
  
export const isDriver = (req, res, next) => {
    if (req.session.isLoggedIn) {
      if (req.session.userType == "Driver") {
        next();
      } else {
        req.session.error = "You have to login first";
        res.redirect("/login");
      }
    } else {
      req.session.error = "You have to login first";
      res.redirect("/login");
    }
};
  
export const isAdmin = (req, res, next) => {
    if (req.session.isLoggedIn) {
      if (req.session.userType == "Admin") {
        next();
      } else {
        req.session.error = "You have to login first";
        res.redirect("/login");
      }
    } else {
      req.session.error = "You have to login first";
      res.redirect("/login");
    }
};

export const isExaminer = (req, res, next) => {
  if (req.session.isLoggedIn) {
    if (req.session.userType == "Examiner") {
      next();
    } else {
      req.session.error = "You have to login first";
      res.redirect("/login");
    }
  } else {
    req.session.error = "You have to login first";
    res.redirect("/login");
  }
};
  
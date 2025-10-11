// import { Link } from "react-router-dom"
// import { Twitter, Github, LinkedIn, FileText } from "lucide-react"

// const FooterLink = ({ href, to, children }) => {
//     const className = "block text-gray-400 hover:text-white transition-colors duration-200"
//     if (to) {
//         return <Link to={to} className={className}>{children}</Link>;
//     }
//     return <a href={href} className={className}>{children}</a>
// };

// const SocialLink = ({ href, children}) => {
//     return (
//         <a 
//             href={href}
//             classname="w-10 h-10 bg-blue-950 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors duration-200"
//             target="_blank"
//             rel="noopener noreferrer"
//         >
//         {children}
//     </a>
//     );
// };

// const Footer = () => {
//   return (
//     <footer className="bg-gray-900 text-white">
//         <div className="">
//             <div className="">
//                 <div className="">
//                     <Link to="/" className="">
//                         <div className="">
//                             <FileText className="" />
//                         </div>
//                         <span className=""> AI Invoice App </span>
//                     </Link>
//                     <p className="">
//                         The simpliest way to create and send professional invoices.
//                     </p>
//                     </div>
//                     <div>
//                         <h3 className="">Product</h3>
//                         <ul className="">
//                             <li>
//                                 <FooterLink href="#features">Features</FooterLink>
//                             </li>
//                             <li>
//                                 <FooterLink href="#testimonials">Testimonials</FooterLink>
//                             </li>
//                             <li>
//                                 <FooterLink href="#faq">FAQ</FooterLink>
//                             </li>
//                         </ul>
//                     </div>
//                     <div>
//                         <h3 className="">Company</h3>
//                         <ul className="">
//                             <li><FooterLink to="/about">About Us</FooterLink></li>
//                             <li><FooterLink to="/contact">Contact</FooterLink></li>
//                         </ul>
//                     </div>
//                     <div>
//                         <h3 className="">Legal</h3>
//                         <ul className="">
//                             <li>
//                                 <FooterLink to="/privacy">Privacy Policy</FooterLink>
//                             </li>
//                             <li>
//                                 <FooterLink to="/terms">Terms of Service</FooterLink>
//                             </li>
//                         </ul>
//                     </div>
//                 </div>
//                 <div className="">
//                     <div className="">
//                         <p className="">
//                             &copy; 2025 AI Invoice App. All rights reserved.
//                         </p>
//                         <div className="">
//                             <SocialLink href="#">
//                                 <Twitter className="" />
//                             </SocialLink>
//                             <SocialLink href="#">
//                                 <Github className="" />
//                             </SocialLink>
//                             <SocialLink href="#">
//                                 <Linkedin className="" />
//                             </SocialLink>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </footer>                  
//   )
// }

// export default Footer
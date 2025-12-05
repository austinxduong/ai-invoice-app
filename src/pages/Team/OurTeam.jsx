import React from 'react';
import { Mail, Linkedin, Github, Baby } from 'lucide-react';

const OurTeam = () => {
    console.log('🔍 OurTeam component loaded!');
  // Sample team member data
  const teamMembers = [
    {
      id: 1,
      name: "Austin X. Duong",
      position: "Founder & CEO / Founding Engineer",
      bio: "Austin is a passionate entrepreneur with a vision to revolutionize the cannabis retail industry through innovative technology solutions. With a background in software development and business strategy, he leads the team in building cutting-edge POS systems.",
      image: "/images/2.jpg",
      email: "austinxduong@gmail.com",
      linkedin: "https://linkedin.com/in/austinxduong",
      github: "https://github.com/austinxduong",
      baby: "https://www.austinxduong.com/"
    }
  ];

  return (
    <div className=" bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 to-green-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Meet Our Team
            </h1>
            <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto">
            </p>
          </div>
        </div>
      </div>

      {/* Team Members Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12"> */}
        <div className="justify-center">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Team Member Card */}
              <div className="p-8 ">
                {/* Photo and Basic Info */}
                <div className="flex items-center space-x-6 mb-6">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-green-100"
                  />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                      {member.name}
                    </h3>
                    <p className="text-green-600 font-semibold text-lg">
                      {member.position}
                    </p>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-gray-600 leading-relaxed mb-6">
                  {member.bio}
                </p>

                {/* Social Links */}
                <div className="flex space-x-4">
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="p-3 bg-gray-100 rounded-full hover:bg-green-100 transition-colors group"
                      title="Send Email"
                    >
                      <Mail className="w-5 h-5 text-gray-600 group-hover:text-green-600" />
                    </a>
                  )}
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-gray-100 rounded-full hover:bg-blue-100 transition-colors group"
                      title="LinkedIn Profile"
                    >
                      <Linkedin className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                    </a>
                  )}
                  {member.github && (
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors group"
                      title="GitHub Profile"
                    >
                      <Github className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
                    </a>
                  )}
                    {member.baby && (
                    <a
                      href={member.baby}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors group"
                      title="portfolio"
                    >
                      <Baby className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>



      {/* Company Values Section */}

            </div>

  );
};

export default OurTeam;
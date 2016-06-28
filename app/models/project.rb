class Project < ActiveRecord::Base
  belongs_to :client ,:class_name => "User" ,:foreign_key => "user_id"
end

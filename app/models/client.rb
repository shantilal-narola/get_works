class Client < User
	
	#associations
	has_many :projects ,:class_name=>"Project"  ,:foreign_key => "user_id" ,:dependent => :destroy 
end


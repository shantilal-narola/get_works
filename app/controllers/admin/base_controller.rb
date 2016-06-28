class Admin::BaseController < ActionController::Base
   layout 'admin'

   before_filter :verify_user_logged_in

   def verify_user_logged_in
	# if user_signed_in?
	# 	if current_user.is_freelancer?
	# 		redirect_to home_index_path
	# 	else
	# 		redirect_to home_index_path
	# 	end
	# else
	# 	redirect_to root_path 
	# end
   end 

end
